/** @jsx jsx */

import { jsx } from '@emotion/core';

import { MouseEvent, ReactNode, useEffect, useReducer } from 'react';
import { SectionHeader } from '@cityofboston/react-fleet';
import { FIELD_CONTAINER_STYLING, INPUTS_STYLING } from './styling';
import { textCopy } from './copy';
import { useDebounce } from '../../utility';
import { initialSearchState, searchReducer, Status } from '../state/search';
import { Group, Mode, Person, View } from '../types';
import Spinner from '../Spinner';
import Section from '../Section';
import AutosuggestWrapper from './AutosuggestWrapper';
import {
  fetchGroupMembers,
  fetchPersonGroups,
} from '../data-fetching/fetch-person-data';
// import { reducer as listReducer } from '../state/list';

interface Props {
  mode: Mode;
  view: View;
  currentUserAllowedGroups?: string[];
  selectedItem?: Group | Person;
  handleFetch: (
    value: string,
    item: any, // Group | Person,
    dns: any
  ) => Promise<Group[] | Person[]>;
  handleSelectClick: (selection: any) => void;
  currentStatus?: Status; // solely for Storybook
  dns: String[];
  cnArray?: Array<string>;
  currentlist?: Array<any>;
  currentPage: number;
  pageSize: number;
  setLoading?: any;
  dispatchState?: any;
  dispatchList?: any;
  changePageCount: (pageCount: number) => void;
}

/**
 * Autocomplete search component. It will display suggestions in two
 * different situations:
 *
 * view: initial
 * Suggestions will be derived from all groups or all people.
 *
 * view: management
 * Suggestions are derived from all groups or people, excluding the
 * currently-selected item’s list of members or groups.
 *
 */
export default function SearchComponent(props: Props) {
  const fetchDelay = 1000;
  const [searchState, dispatchSearchState] = useReducer(
    searchReducer,
    initialSearchState
  );

  const {
    mode,
    view,
    dns,
    cnArray,
    pageSize,
    // setLoading,
    currentPage,
    currentlist,
    currentStatus,
    changePageCount,
  } = props;
  const { searchStatus, searchText, searchResults, selection } = searchState;

  // Associate label with search field.
  const inputId = `search-${view}-${mode}`;
  const debouncedValue = useDebounce(searchText, fetchDelay);
  const updateSuggestions = (result: Array<Group | Person>): void => {
    let res = result;
    dispatchSearchState({
      type: 'SEARCH/UPDATE_SUGGESTIONS',
      searchResults: res,
      mode: mode,
    });
  };

  // Note: remember that this is also fired when a user uses the keyboard
  // to make a selection and then hits “enter”
  const handleClick = async (
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.preventDefault();

    if (
      cnArray &&
      cnArray.length > 1 &&
      searchState.searchStatus === 'duplicate'
    ) {
      handleChange('');
    } else {
      const new_currentlist =
        currentlist && currentlist.length > 0 ? currentlist : [{ cn: '' }];
      const newArr = new_currentlist.map(entry => entry.cn);
      const isDup = isSelectionDuplication(newArr, selection.cn);

      if (!isDup.duplication) {
        selection.action = 'new';

        let members: any = [];
        const dataFetched = () => {
          selection.groupmember = members;
          // console.log(`members: ${members.length}`);
          changePageCount(members.length);
          if (view !== 'management') {
            props.handleSelectClick(selection);
            props.dispatchList({
              type: 'LIST/LOAD_LIST',
              list: selection.groupmember[currentPage],
            });
          } else {
            props.handleSelectClick(selection);
            props.dispatchState({ type: 'SEARCH/SUBMIT_SELECTION' });
          }
        };

        if (mode === 'group') {
          await fetchGroupMembers(selection.dn, pageSize).then(result => {
            members = result;
            dataFetched();
          });
        } else {
          await fetchPersonGroups(selection.dn, pageSize).then(result => {
            members = result;
            dataFetched();
          });
        }
      } else {
        handleChange('');
      }
    }
  };

  const handleChange = (text: string): void => {
    dispatchSearchState({
      type: 'SEARCH/UPDATE_SEARCH_TEXT',
      searchText: text,
    });
  };

  const handleSelection = (
    selection: Group | Person,
    selectionValue: string
  ): void => {
    // console.log('SearchComponent > handleSelection > handleSelection > selection: ', selectionValue, selection);
    dispatchSearchState({
      type: 'SEARCH/UPDATE_SELECTION',
      selection,
      selectionValue,
    });
  };

  const handleFetch = (): void => {
    dispatchSearchState({
      type: 'SEARCH/UPDATE_STATUS',
      searchStatus: 'searching',
    });

    if (view === 'initial') {
      props
        .handleFetch(searchText, null, dns)
        .then(result => {
          return updateSuggestions(result);
        })
        .catch(() =>
          dispatchSearchState({
            type: 'SEARCH/UPDATE_STATUS',
            searchStatus: 'fetchError',
          })
        );
    } else {
      props
        .handleFetch(searchText, props.selectedItem as Person | Group, dns)
        .then(result => updateSuggestions(result));
    }
  };

  function statusIndicator(): ReactNode {
    if (searchStatus === 'noResults') {
      return <span className="status no-results">No results found</span>;
    } else if (searchStatus === 'fetchError') {
      return (
        <span className="status no-results">Server error: failed to fetch</span>
      );
    } else if (searchStatus === 'searching') {
      return (
        <span className="status working">
          <Spinner size="1.6em" /> <span>Searching...</span>
        </span>
      );
    }

    return null;
  }

  const isSelectionDuplication = (cnArray: Array<string>, cn: string) => {
    let warningLabel = '';
    let duplication = false;

    if (cnArray && cnArray.length > 0) {
      const newArr = cnArray.map(entry => {
        if (entry && entry.indexOf('=') > -1) {
          return entry.split('=')[1];
        } else {
          return entry;
        }
      });

      if (newArr && newArr.indexOf(cn) > -1) {
        warningLabel = 'Already Added';
        duplication = true;
      }
    }

    return { duplication, warningLabel };
  };

  const buttonLabel = () => {
    if (
      cnArray &&
      cnArray.length > 0 &&
      searchState.searchStatus === 'duplicate'
    ) {
      return textCopy[view][mode].clear;
    } else {
      return textCopy[view][mode].button;
    }
  };

  const buttonDisabled = () => {
    if (
      cnArray &&
      cnArray.length > 0 &&
      searchState.searchStatus === 'duplicate'
    ) {
      return false;
    } else {
      return !selection.cn;
    }
  };

  const defaultSearchText = (_newText: any = 0) => {
    if (_newText && typeof _newText === 'string') {
      return _newText;
    } else {
      return searchText;
    }
  };

  // used solely for Storybook; ensures specified status searchState is displayed.
  useEffect(() => {
    if (currentStatus) {
      dispatchSearchState({
        type: 'SEARCH/UPDATE_STATUS',
        searchStatus: currentStatus,
      });
    }
  }, []);

  // Clear typed input and suggestions if search type changes.
  useEffect(() => {
    if (searchText.length > 0)
      dispatchSearchState({ type: 'SEARCH/RESET_STATE' });
  }, [mode]);

  // Clear suggestions if search text has been removed.
  useEffect(() => {
    if (!searchText && !currentStatus) {
      dispatchSearchState({ type: 'SEARCH/CLEAR_SUGGESTIONS' });
    }
  }, [searchText]);

  // Debounce to minimize fetching from server; don’t trigger fetch until
  // at least two characters have been input; prevent fetch if selection
  // has been made.
  useEffect(() => {
    if (
      debouncedValue &&
      debouncedValue.length >= 2 &&
      searchText !== searchState.selectionValue
    ) {
      handleFetch();
    }
  }, [debouncedValue]);

  return (
    <Section>
      <SectionHeader title={textCopy[view][mode].title} />

      <form>
        <div role="search">
          <label htmlFor={inputId} className="txt-l">
            {textCopy[view][mode].label}
          </label>

          <div css={INPUTS_STYLING}>
            <div css={FIELD_CONTAINER_STYLING}>
              <AutosuggestWrapper
                id={inputId}
                placeholder={`Search by ${
                  mode === 'person' ? 'name or ID' : 'group name'
                }`}
                onChange={handleChange}
                searchText={defaultSearchText()}
                searchResults={searchResults}
                onSuggestionSelected={handleSelection}
                cnArray={cnArray}
                isSelectionDuplication={isSelectionDuplication}
              />

              {statusIndicator()}
            </div>

            <button
              type="submit"
              className="btn"
              onClick={handleClick}
              disabled={buttonDisabled()}
            >
              {buttonLabel()}
            </button>
          </div>
        </div>
      </form>
    </Section>
  );
}
