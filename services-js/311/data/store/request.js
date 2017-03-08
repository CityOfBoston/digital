// @flow

import type { Service, ServiceMetadataAttribute, CalculatedAttribute, ServiceMetadataAttributeValuesCondition } from '../types';

import type { LoopbackGraphql } from '../graphql/loopback-graphql';
import type { SubmitRequestMutationVariables, SubmitRequestMutation } from '../graphql/schema.flow';
import SubmitRequestGraphql from '../graphql/SubmitRequest.graphql';

type AttributeValuesMap = {[code: string]: string | string[]};

export type Action =
  {| type: 'REQUEST_SET_DESCRIPTION', payload: string |} |
  {| type: 'REQUEST_SET_FIRST_NAME', payload: string |} |
  {| type: 'REQUEST_SET_LAST_NAME', payload: string |} |
  {| type: 'REQUEST_SET_EMAIL', payload: string |} |
  {| type: 'REQUEST_SET_PHONE', payload: string |} |
  {| type: 'REQUEST_SET_ATTRIBUTE', payload: {| code: string, value: string | string[] |} |} |
  {| type: 'REQUEST_SET_LOCATION', payload: {| location: ?{| lat: number, lng: number |}, address: string |} |} |
  {| type: 'REQUEST_RESET_FOR_SERVICE', payload: Service |};

export type State = {
  code: ?string,
  description: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  location: ?{|
    lat: number,
    lng: number,
  |},
  address: string,
  // Map of the data that the user has set in the form. This may contain data
  // that is not displayed, e.g. the value of a select box that no longer
  // appears because a box was unchecked.
  attributeValues: AttributeValuesMap,
  // Attributes copied off of a Service.
  rawAttributes: ServiceMetadataAttribute[],
  // Filtered version of rawAttributes that includes only visible questions and
  // allowed values of depenedent picklists.
  calculatedAttributes: CalculatedAttribute[],
}

export const setRequestDescription = (description: string): Action => ({
  type: 'REQUEST_SET_DESCRIPTION',
  payload: description,
});

export const setRequestFirstName = (firstName: string): Action => ({
  type: 'REQUEST_SET_FIRST_NAME',
  payload: firstName,
});

export const setRequestLastName = (lastName: string): Action => ({
  type: 'REQUEST_SET_LAST_NAME',
  payload: lastName,
});

export const setRequestEmail = (email: string): Action => ({
  type: 'REQUEST_SET_EMAIL',
  payload: email,
});

export const setRequestPhone = (phone: string): Action => ({
  type: 'REQUEST_SET_PHONE',
  payload: phone,
});

export const setAttribute = (code: string, value: string | string[]): Action => ({
  type: 'REQUEST_SET_ATTRIBUTE',
  payload: { code, value },
});

export const setLocation = (location: ?{| lat: number, lng: number |}, address: string): Action => ({
  type: 'REQUEST_SET_LOCATION',
  payload: { location, address },
});

export const resetRequestForService = (service: Service): Action => ({
  type: 'REQUEST_RESET_FOR_SERVICE',
  payload: service,
});

// Given the value from the form input and a potentially null list of { key, name }
// objects, returns a version of currentValue that conforms to the values.
// If values is null, assumes that there's no value limiting (e.g. a string
// input). If currentValue is not found in values, returns null.
function filterValidValues(currentValue, values) {
  if (!values) {
    return currentValue;
  }

  const valuesArr = values;

  const isValid = (val) => !!valuesArr.find(({ key }) => key === val);
  if (Array.isArray(currentValue)) {
    return currentValue.filter(isValid);
  } else if (isValid(currentValue)) {
    return currentValue;
  } else {
    return null;
  }
}

export const submitRequest = async (state: State, loopbackGraphql: LoopbackGraphql): Promise<SubmitRequestMutation> => {
  const { code: serviceCode, description, firstName, lastName, email, phone, location, address, attributeValues, calculatedAttributes } = state;

  if (!serviceCode) {
    throw new Error(`code not currently set in state: ${JSON.stringify(state, null, 2)}`);
  }

  const calculatedAttributesByCode = {};
  calculatedAttributes.forEach((attr) => { calculatedAttributesByCode[attr.code] = attr; });

  const attributesArray = [];

  // We only iterate over the displayed form fields when doing a submit. Note
  // that attributeValues may contain data for fields that are not currently
  // being shown, and we don't want to submit those.
  calculatedAttributes.forEach(({ code, values }) => {
    const value = filterValidValues(attributeValues[code], values);

    if (Array.isArray(value)) {
      value.forEach((v) => {
        attributesArray.push({ code, value: v });
      });
    } else if (value !== null) {
      attributesArray.push({ code, value });
    }
  });

  const vars: SubmitRequestMutationVariables = {
    code: serviceCode,
    description,
    firstName,
    lastName,
    email,
    phone,
    location,
    address,
    attributes: attributesArray,
  };

  return loopbackGraphql(SubmitRequestGraphql, vars);
};

export const DEFAULT_STATE: State = {
  code: null,
  description: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: null,
  address: '',
  attributeValues: {},
  rawAttributes: [],
  calculatedAttributes: [],
};

function generateAttributeValueDefaults(metadata) {
  const attributeValuesByCode = {};

  (metadata ? metadata.attributes : []).forEach(({ code, type }) => {
    let val;

    switch (type) {
      case 'INFORMATIONAL': return;
      case 'SINGLEVALUELIST': val = null; break;
      case 'MULTIVALUELIST': val = []; break;
      default: val = '';
    }

    attributeValuesByCode[code] = val;
  });

  return attributeValuesByCode;
}

function conditionEq(currentValue, { type, string, number, array }) {
  switch (type) {
    case 'STRING': return currentValue === string;
    case 'STRING_ARRAY': {
      if (!array || !Array.isArray(currentValue)) {
        return false;
      }
      // Making copies since sort mutates
      const currentValueArr = [...currentValue].sort();
      const expectedValueArr = [...array].sort();

      // array equality!
      return currentValueArr.length === expectedValueArr.length &&
        currentValueArr.filter((el, i) => el === expectedValueArr[i]).length === currentValueArr.length;
    }
    case 'NUMBER': return parseFloat(currentValue, 10) === number;
    default: throw new Error('Unknown type');
  }
}

function conditionIn(currentValue, { string }) {
  if (string === null || string === undefined || !Array.isArray(currentValue)) {
    return false;
  }

  return currentValue.indexOf(string) !== -1;
}

function conditionNumericOp(currentValue, { number }, op) {
  if (number === null || number === undefined || typeof currentValue !== 'string') {
    return false;
  }

  const currentNumber = parseFloat(currentValue);
  return op(currentNumber, number);
}

// Calculates a ServiceMetadataAttributeValuesCondition block, which includes
// a clause of either 'AND' or 'OR' and a list of eq/neq conditions to
// evaluate against other data on the form.
//
// We evaluate data against attributeValues higher up in the form to avoid
// circular dependencies across form elements.
export function conditionsApply(attributeValues: AttributeValuesMap, { clause, conditions }: ServiceMetadataAttributeValuesCondition) {
  // number of conditions that must be true for us to be true
  const minConditions = clause === 'AND' ? conditions.length : 1;

  return conditions.filter(({ attribute, op, value }) => {
    const currentValue = attributeValues[attribute];
    switch (op) {
      case 'eq': return conditionEq(currentValue, value);
      case 'neq': return !conditionEq(currentValue, value);
      case 'in': return conditionIn(currentValue, value);
      case 'gt': return conditionNumericOp(currentValue, value, (a, b) => a > b);
      case 'gte': return conditionNumericOp(currentValue, value, (a, b) => a >= b);
      case 'lt': return conditionNumericOp(currentValue, value, (a, b) => a < b);
      case 'lte': return conditionNumericOp(currentValue, value, (a, b) => a <= b);
      default:
        return false;
    }
  }).length >= minConditions;
}

function calculateAttributes(rawAttributes: ServiceMetadataAttribute[], attributeValues: AttributeValuesMap): CalculatedAttribute[] {
  // We build up a map of attribute values as they appear on the form and use
  // this to calculate field visibility. This prevents cycles (since dependencies
  // can only be on previous things) and accounts for when hidden questions
  // still have values stored in attributeValues.
  const visibleAttributeValues: AttributeValuesMap = {};
  const calculatedAttributes = [];

  rawAttributes.forEach(({ code, type, required, description, values, conditionalValues, dependencies }) => {
    // This variable will hold any static values as well as any conditional
    // values that come up due to dependencies.
    let combinedValues = null;

    if (values !== null || conditionalValues !== null) {
      const activeConditionals = (conditionalValues || []).filter(({ dependentOn }) => (
        conditionsApply(visibleAttributeValues, dependentOn)
      ));
      const calculatedValues = [].concat(...activeConditionals.map((c) => c.values));
      combinedValues = [...(values || []), ...calculatedValues];
    }

    if (dependencies && !conditionsApply(visibleAttributeValues, dependencies)) {
      return;
    }

    const filteredValue = filterValidValues(attributeValues[code], combinedValues);

    if (filteredValue) {
      visibleAttributeValues[code] = filteredValue;
    }

    calculatedAttributes.push({
      code,
      type,
      required,
      description,
      values: combinedValues,
    });
  });

  return calculatedAttributes;
}

export default function reducer(state: State = DEFAULT_STATE, action: Action): State {
  switch (action.type) {
    case 'REQUEST_SET_DESCRIPTION': return { ...state, description: action.payload };
    case 'REQUEST_SET_FIRST_NAME': return { ...state, firstName: action.payload };
    case 'REQUEST_SET_LAST_NAME': return { ...state, lastName: action.payload };
    case 'REQUEST_SET_EMAIL': return { ...state, email: action.payload };
    case 'REQUEST_SET_PHONE': return { ...state, phone: action.payload };
    case 'REQUEST_SET_LOCATION': return { ...state, ...action.payload };

    case 'REQUEST_SET_ATTRIBUTE': {
      const { code, value } = action.payload;
      if (typeof state.attributeValues[code] === 'undefined') {
        throw new Error(`Attribute code ${code} not found in the current service (${state.code || 'not set'})`);
      }

      const attributeValues = {
        ...state.attributeValues,
        [code]: value,
      };

      const calculatedAttributes = calculateAttributes(state.rawAttributes, attributeValues);

      return {
        ...state,
        attributeValues,
        calculatedAttributes,
      };
    }

    case 'REQUEST_RESET_FOR_SERVICE': {
      const service = action.payload;

      if (service.code === state.code) {
        return state;
      }

      const attributeValues = generateAttributeValueDefaults(service.metadata);
      const rawAttributes = service.metadata ? service.metadata.attributes : [];
      const calculatedAttributes = calculateAttributes(rawAttributes, attributeValues);

      return {
        ...state,
        code: service.code,
        attributeValues,
        rawAttributes,
        calculatedAttributes,
      };
    }

    default:
      return state;
  }
}
