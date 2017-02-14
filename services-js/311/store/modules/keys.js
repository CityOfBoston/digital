// @flow
//
// Module for API keys we need on the client.

export type State = {
  googleApi: ?string,
}

export type Action = {| type: 'KEYS_SET', payload: State |};

export const setKeys = (keys: State): Action => ({
  type: 'KEYS_SET',
  payload: keys,
});

const DEFAULT_STATE = {
  googleApi: null,
};

export default function reducer(state: State = DEFAULT_STATE, action: Action): State {
  switch (action.type) {
    case 'KEYS_SET':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
