// @flow

import type { Service } from '../types';

export type Action =
  {| type: 'SERVICE_ADD_SERVICE_TO_CACHE', payload: Service |}

export type State = {
  cache: {[code: string]: Service}
}

export const addServiceToCache = (service: Service): Action => ({
  type: 'SERVICE_ADD_SERVICE_TO_CACHE',
  payload: service,
});

export const DEFAULT_STATE = {
  cache: {},
};

export function selectCachedService(state: State, code: string): ?Service {
  return state.cache[code] || null;
}

export default function reducer(state: State = DEFAULT_STATE, action: Action): State {
  switch (action.type) {
    case 'SERVICE_ADD_SERVICE_TO_CACHE': {
      const { code } = action.payload;
      return { ...state, cache: { ...state.cache, [code]: action.payload } };
    }
    default: return state;
  }
}
