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
  attributeValues: AttributeValuesMap,
  rawAttributes: ServiceMetadataAttribute[],
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


export const submitRequest = async (state: State, loopbackGraphql: LoopbackGraphql): Promise<SubmitRequestMutation> => {
  const { code, description, firstName, lastName, email, phone, location, address, attributeValues, calculatedAttributes } = state;

  if (!code) {
    throw new Error(`code not currently set in state: ${JSON.stringify(state, null, 2)}`);
  }

  const calculatedAttributesByCode = {};
  calculatedAttributes.forEach((attr) => { calculatedAttributesByCode[attr.code] = attr; });

  const attributesArray = [];
  Object.keys(attributeValues).forEach((c) => {
    const value = attributeValues[c];

    const calculatedAttribute = calculatedAttributesByCode[c];
    if (!calculatedAttribute) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (!calculatedAttribute.values || calculatedAttribute.values.find(({ key }) => key === v)) {
          attributesArray.push({ code: c, value: v });
        }
      });
    } else if (!calculatedAttribute.values || calculatedAttribute.values.find(({ key }) => key === value)) {
      attributesArray.push({ code: c, value });
    }
  });

  const vars: SubmitRequestMutationVariables = {
    code,
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

export function conditionsApply(attributeValues: AttributeValuesMap, { clause, conditions }: ServiceMetadataAttributeValuesCondition) {
  // number of conditions that must be true for us to be true
  const minConditions = clause === 'AND' ? conditions.length : 1;

  return conditions.filter(({ attribute, op, value }) => {
    const currentValue = attributeValues[attribute];
    if (Array.isArray(currentValue)) {
      const idx = currentValue.indexOf(value);
      if (op === 'eq') {
        return idx !== -1;
      } else {
        return idx === -1;
      }
    } else if (op === 'eq') {
      return currentValue === value;
    } else {
      return currentValue !== value;
    }
  }).length >= minConditions;
}

function calculateAttributes(rawAttributes: ServiceMetadataAttribute[], attributeValues: AttributeValuesMap): CalculatedAttribute[] {
  return rawAttributes.map(({ code, type, required, description, values, conditionalValues }) => {
    const activeConditionals = (conditionalValues || []).filter(({ dependentOn }) => conditionsApply(attributeValues, dependentOn));
    const calculatedValues = [].concat(...activeConditionals.map((c) => c.values));

    return {
      code,
      type,
      required,
      description,
      values: [...(values || []), ...calculatedValues],
    };
  });
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
