/* eslint no-console: 0 */
// todo

import {
  Group,
  Mode,
  Person,
  View,
  CurrentPage,
  pageSize,
  startPage,
  currentPage,
  pageCount,
  PageCount,
} from '../types';

export type ActionTypes =
  | 'APP/CHANGE_VIEW'
  | 'APP/CHANGE_MODE'
  | 'APP/RESET_STATE'
  | 'APP/SET_SELECTED'
  | 'APP/CLEAR_SELECTED'
  | 'APP/SET_OUS'
  | 'APP/SET_API'
  | 'APP/CHANGE_PAGE'
  | 'APP/CHANGE_PAGECOUNT';

interface Action {
  type: ActionTypes;
  view?: View;
  mode?: Mode;
  selected?: Group | Person;
  ous?: [string];
  api?: string;
  currentPage?: CurrentPage;
  pageCount?: PageCount;
}

export const initialState = {
  view: 'initial',
  mode: 'group',
  selected: {},
  ous: [],
  api: '',
  pageSize,
  startPage,
  currentPage,
  pageCount,
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

    case 'APP/SET_OUS':
      return { ...state, ous: action.ous };

    case 'APP/SET_API':
      return { ...state, api: action.api };

    case 'APP/CLEAR_SELECTED':
      return { ...state, selected: {} };

    case 'APP/RESET_STATE':
      return initialState;

    case 'APP/CHANGE_PAGE':
      return { ...state, currentPage: action.currentPage };

    case 'APP/CHANGE_PAGECOUNT':
      return { ...state, pageCount: action.pageCount };

    default:
      return state;
  }
};
