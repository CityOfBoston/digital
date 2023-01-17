/* eslint no-console: 0 */
// todo

import { Group, Person } from '../types';

export type Status =
  | 'searching'
  | 'idle'
  | 'noResults'
  | 'fetchError'
  | 'duplicate';

type ActionTypes =
  | 'SEARCH/UPDATE_STATUS'
  | 'SEARCH/UPDATE_SEARCH_TEXT'
  | 'SEARCH/UPDATE_SUGGESTIONS'
  | 'SEARCH/CLEAR_SUGGESTIONS'
  | 'SEARCH/UPDATE_SELECTION'
  | 'SEARCH/CLEAR_SELECTION'
  | 'SEARCH/SUBMIT_SELECTION'
  | 'SEARCH/RESET_STATE';

interface Action {
  type: ActionTypes;
  searchResults?: Array<Group | Person>;
  searchStatus?: Status;
  searchText?: string;
  selection?: Group | Person;
  selectionValue?: string;
}

export const initialState = {
  searchResults: [],
  searchStatus: 'idle',
  searchText: '',
  selection: {} as Person,
  selectionValue: '',
};

export const reducer = (state, action: Partial<Action>) => {
  //@ts-ignore todo
  // console.info(action.type);

  switch (action.type) {
    case 'SEARCH/UPDATE_STATUS':
      return { ...state, searchStatus: action.searchStatus };

    case 'SEARCH/UPDATE_SEARCH_TEXT':
      return { ...state, searchText: action.searchText, searchStatus: 'idle' };

    case 'SEARCH/UPDATE_SUGGESTIONS':
      return {
        ...state,
        searchResults: action.searchResults,
        searchStatus:
          state.searchText.indexOf('Already Added') > -1
            ? 'duplicate'
            : action.searchResults && action.searchResults.length > 0
            ? 'idle'
            : 'noResults',
      };

    case 'SEARCH/CLEAR_SUGGESTIONS':
      return {
        ...state,
        searchResults: [],
        searchStatus: 'idle',
      };

    case 'SEARCH/UPDATE_SELECTION':
      return {
        ...state,
        selection: action.selection,
        selectionValue: action.selectionValue,
      };

    case 'SEARCH/CLEAR_SELECTION':
      return { ...state, selection: {} as Person, selectionValue: '' };

    case 'SEARCH/SUBMIT_SELECTION':
      return { ...state, searchText: '', searchResults: [] };

    case 'SEARCH/RESET_STATE':
      return initialState;

    default:
      return state;
  }
};
