/* eslint no-console: 0 */
// todo

import { Group, Mode, Person, View } from '../types';

export type ActionTypes =
  | 'APP/CHANGE_VIEW'
  | 'APP/CHANGE_MODE'
  | 'APP/RESET_STATE'
  | 'APP/SET_SELECTED'
  | 'APP/CLEAR_SELECTED';

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
  // console.info(action.type);

  switch (action.type) {
    case 'APP/CHANGE_VIEW':
      return { ...state, view: action.view };

    case 'APP/CHANGE_MODE':
      return { ...state, mode: action.mode };

    case 'APP/SET_SELECTED':
      return { ...state, selected: action.selected };

    case 'APP/CLEAR_SELECTED':
      return { ...state, selected: {} };

    case 'APP/RESET_STATE':
      return initialState;

    default:
      return state;
  }
};
