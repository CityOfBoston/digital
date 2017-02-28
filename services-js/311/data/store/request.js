// @flow

import type { Service } from '../types';

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
  attributes: {[code: string]: string | string[]},
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

export const resetForService = (service: Service): Action => ({
  type: 'REQUEST_RESET_FOR_SERVICE',
  payload: service,
});

export const DEFAULT_STATE: State = {
  code: null,
  description: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: null,
  address: '',
  attributes: {},
};

function generateAttributeDefaults(metadata) {
  const attributesByCode = {};

  (metadata ? metadata.attributes : []).forEach(({ code, type, values }) => {
    if (type === 'INFORMATIONAL' || type === 'STRING') {
      return;
    }

    if (values && values.length) {
      attributesByCode[code] = values[0].key;
    } else {
      attributesByCode[code] = '';
    }
  });

  return attributesByCode;
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
      if (typeof state.attributes[code] === 'undefined') {
        throw new Error(`Attribute code ${code} not found in the current service (${state.code || 'not set'})`);
      }

      return {
        ...state,
        attributes: {
          ...state.attributes,
          [code]: value,
        },
      };
    }

    case 'REQUEST_RESET_FOR_SERVICE': {
      const service = action.payload;

      if (service.code === state.code) {
        return state;
      }

      return {
        ...state,
        code: service.code,
        attributes: generateAttributeDefaults(service.metadata),
      };
    }

    default:
      return state;
  }
}
