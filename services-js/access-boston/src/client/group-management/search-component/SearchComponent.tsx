/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent, ReactNode, useEffect, useReducer } from 'react';

import {
  FREEDOM_RED_DARK,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SectionHeader,
} from '@cityofboston/react-fleet';

import { useDebounce } from '../../utility';

import { initialState, reducer, Status } from '../state/search';

import { Group, Mode, Person, View } from '../types';

import Spinner from '../Spinner';
import Section from '../Section';

import AutosuggestWrapper from './AutosuggestWrapper';

interface Props {
  mode: Mode;
  view: View;
  currentUserAllowedGroups?: string[];
  selectedItem?: Group | Person;
  handleFetch: (
    value: string,
    item //?: Group | Person;
  ) => Promise<Group[] | Person[]>;
  handleSelectClick: (selection: any) => void;
  currentStatus?: Status; // solely for Storybook
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

  const [state, dispatch] = useReducer(reducer, initialState);

  const { currentStatus, mode, view } = props;
  const { searchStatus, searchText, searchResults, selection } = state;

  // Associate label with search field.
  const inputId = `search-${view}-${mode}`;

  const debouncedValue = useDebounce(searchText, fetchDelay);

  const updateSuggestions = (result: Array<Group | Person>): void => {
    dispatch({ type: 'SEARCH/UPDATE_SUGGESTIONS', searchResults: result });
  };

  // Note: remember that this is also fired when a user uses the keyboard
  // to make a selection and then hits “enter”
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    props.handleSelectClick(selection);

    dispatch({ type: 'SEARCH/SUBMIT_SELECTION' });
  };

  const handleChange = (text: string): void => {
    dispatch({
      type: 'SEARCH/UPDATE_SEARCH_TEXT',
      searchText: text,
    });
  };

  const handleSelection = (
    selection: Group | Person,
    selectionValue: string
  ): void => {
    dispatch({ type: 'SEARCH/UPDATE_SELECTION', selection, selectionValue });
  };

  const handleFetch = (): void => {
    dispatch({ type: 'SEARCH/UPDATE_STATUS', searchStatus: 'searching' });

    if (view === 'initial') {
      props
        .handleFetch(searchText, null)
        .then(result => updateSuggestions(result))
        .catch(() =>
          dispatch({ type: 'SEARCH/UPDATE_STATUS', searchStatus: 'fetchError' })
        );
    } else {
      props
        .handleFetch(searchText, props.selectedItem as Person | Group)
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

  // used solely for Storybook; ensures specified status state is displayed.
  useEffect(() => {
    if (currentStatus) {
      dispatch({ type: 'SEARCH/UPDATE_STATUS', searchStatus: currentStatus });
    }
  }, []);

  // Clear typed input and suggestions if search type changes.
  useEffect(() => {
    if (searchText.length > 0) dispatch({ type: 'SEARCH/RESET_STATE' });
  }, [mode]);

  // Clear suggestions if search text has been removed.
  useEffect(() => {
    if (!searchText && !currentStatus) {
      dispatch({ type: 'SEARCH/CLEAR_SUGGESTIONS' });
    }
  }, [searchText]);

  // Debounce to minimize fetching from server; don’t trigger fetch until
  // at least two characters have been input; prevent fetch if selection
  // has been made.
  useEffect(() => {
    if (
      debouncedValue &&
      debouncedValue.length >= 2 &&
      searchText !== state.selectionValue
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
                searchText={searchText}
                searchResults={searchResults}
                onSuggestionSelected={handleSelection}
              />

              {statusIndicator()}
            </div>

            <button
              type="submit"
              className="btn"
              onClick={handleClick}
              disabled={!selection.cn}
            >
              {textCopy[view][mode].button}
            </button>
          </div>
        </div>
      </form>
    </Section>
  );
}

const textCopy = {
  initial: {
    person: {
      title: 'Person search',
      label: 'Find a person',
      button: 'Select',
    },
    group: {
      title: 'Group search',
      label: 'Find a group',
      button: 'Select',
    },
  },
  management: {
    person: {
      title: 'Add a new member',
      label: 'Find a person to add',
      button: 'Add member',
    },
    group: {
      title: 'Add to a group',
      label: 'Find a group to add',
      button: 'Add group',
    },
  },
};

const FIELD_CONTAINER_STYLING = css({
  position: 'relative',

  '.status': {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '1rem',

    display: 'flex',

    fontFamily: SANS,
  },

  '.no-results': {
    color: FREEDOM_RED_DARK,
  },

  '.working': {
    color: OPTIMISTIC_BLUE_DARK,
  },
});

const INPUTS_STYLING = css({
  display: 'flex',

  '> div': {
    width: '100%',
  },

  button: {
    marginLeft: '0.5em',
    flexShrink: 0,
  },

  'input[type="search"]': {
    '&::-webkit-search-cancel-button': {
      WebkitAppearance: 'none',
    },
    '&::-webkit-calendar-picker-indicator': {
      display: 'none',
    },
  },
});
