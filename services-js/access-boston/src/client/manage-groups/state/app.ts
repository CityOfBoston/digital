/* eslint no-console: 0 */
// todo

import { Group, Mode, Person, View } from '../types';

export type ActionTypes =
  | 'CHANGE_VIEW'
  | 'CHANGE_MODE'
  | 'RESET_STATE'
  | 'SET_SELECTED'
  | 'CLEAR_SELECTED';

interface Action {
  type: ActionTypes;
  view?: View;
  mode?: Mode;
  selected?: Group | Person;
}

export const initialState = {
  view: 'initial',
  mode: 'group',
  selected: {},
};

export const reducer = (state, action: Partial<Action>) => {
  //@ts-ignore todo
  console.info(action.type);

  switch (action.type) {
    case 'CHANGE_VIEW':
      return { ...state, view: action.view };

    case 'CHANGE_MODE':
      return { ...state, mode: action.mode };

    case 'SET_SELECTED':
      return { ...state, selected: action.selected };

    case 'CLEAR_SELECTED':
      return { ...state, selected: {} };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
};
