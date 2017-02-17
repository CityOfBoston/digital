// @flow

import { handle } from 'redux-pack';

import RequestSubmitGraphql from '../graphql/RequestSubmit.graphql';
import type { RequestSubmitMutationVariables } from '../graphql/schema.flow';
import type { Dispatch, Deps } from '.';

export type Action =
  {| type: 'REQUEST_SET_DESCRIPTION', payload: string |} |
  {| type: 'REQUEST_SET_CODE', payload: string |} |
  {| type: 'REQUEST_SET_FIRST_NAME', payload: string |} |
  {| type: 'REQUEST_SET_LAST_NAME', payload: string |} |
  {| type: 'REQUEST_SET_EMAIL', payload: string |} |
  {| type: 'REQUEST_SET_PHONE', payload: string |} |
  {| type: 'REQUEST_SUBMIT', payload: any |};

export type State = {
  description: string,
  code: ?string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  submitting: boolean,
  submitError: ?Object,
}

export const setRequestDescription = (description: string): Action => ({
  type: 'REQUEST_SET_DESCRIPTION',
  payload: description,
});

export const setRequestServiceCode = (code: string): Action => ({
  type: 'REQUEST_SET_CODE',
  payload: code,
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

// Submits the service request based on the current values in the store.
//
// This action creator uses redux-thunk in order to get access to getState().
export const submitRequest = () => ({ loopbackGraphql }: Deps) => (dispatch: Dispatch, getState: () => { request: State }): Promise<any> => {
  const request = getState().request;

  if (!request.code) {
    throw new Error('code is not set!');
  }

  const variables: RequestSubmitMutationVariables = {
    code: request.code,
    description: request.description,
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    phone: request.phone,
  };

  return dispatch({
    type: 'REQUEST_SUBMIT',
    promise: loopbackGraphql(RequestSubmitGraphql, variables),
  });
};

const DEFAULT_STATE = {
  description: '',
  code: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  submitting: false,
  submitError: null,
};

export default function reducer(state: State = DEFAULT_STATE, action: Action): State {
  switch (action.type) {
    case 'REQUEST_SET_DESCRIPTION': return { ...state, description: action.payload };
    case 'REQUEST_SET_CODE': return { ...state, code: action.payload };
    case 'REQUEST_SET_FIRST_NAME': return { ...state, firstName: action.payload };
    case 'REQUEST_SET_LAST_NAME': return { ...state, lastName: action.payload };
    case 'REQUEST_SET_EMAIL': return { ...state, email: action.payload };
    case 'REQUEST_SET_PHONE': return { ...state, phone: action.payload };

    case 'REQUEST_SUBMIT': {
      const { payload } = action;
      return handle(state, action, {
        start: (s) => ({ ...s, submitting: true, submitError: null }),
        success: (s) => ({ ...s }),
        failure: (s) => ({ ...s, submitError: payload }),
        finish: (s) => ({ ...s, submitting: false }),
      });
    }

    default:
      return state;
  }
}
