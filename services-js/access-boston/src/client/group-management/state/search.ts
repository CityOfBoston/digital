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
  mode?: string;
}

export const initialSearchState = {
  searchResults: [],
  searchStatus: 'idle',
  searchText: '',
  selection: {} as Person,
  selectionValue: '',
  mode: '',
};

export const searchReducer = (state, action: Partial<Action>) => {
  //@ts-ignore todo
  // console.info(action.type);

  switch (action.type) {
    case 'SEARCH/UPDATE_STATUS':
      return { ...state, searchStatus: action.searchStatus };

    case 'SEARCH/UPDATE_SEARCH_TEXT':
      return { ...state, searchText: action.searchText, searchStatus: 'idle' };

    case 'SEARCH/UPDATE_SUGGESTIONS': {
      let result = action.searchResults || [];
      if (action.mode && action.mode === 'person') {
        result = result.sort(
          (a: any, b: any) =>
            // a['sn'] - b['sn']
            a['sn'].localeCompare(b['sn']) ||
            a['givenName'].localeCompare(b['givenName'])
        );
      }

      return {
        ...state,
        searchResults: result,
        searchStatus:
          state.searchText.indexOf('Already Added') > -1
            ? 'duplicate'
            : action.searchResults && action.searchResults.length > 0
            ? 'idle'
            : 'noResults',
      };
    }

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
      return initialSearchState;

    default:
      return state;
  }
};
