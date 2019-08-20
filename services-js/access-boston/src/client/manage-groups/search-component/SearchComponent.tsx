/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent, useEffect, useState } from 'react';

import { SectionHeader } from '@cityofboston/react-fleet';

import { Group, Mode, Person, View } from '../types';

import Section from '../Section';

import AutosuggestWrapper from './AutosuggestWrapper';

interface Props {
  mode: Mode;
  view: View;
  selectedItem?: Group | Person;
  handleFetch: (
    value: string,
    item //?: Group | Person;
  ) => Promise<Group[] | Person[]>;
  handleSelectClick: (selection: any) => void;
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

  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Group[] | Person[]>([]);
  const [selection, setSelection] = useState<Group | Person>({} as Group);

  const { mode, view } = props;

  // Associate label with control.
  const inputId = `search-${view}-${mode}`;

  // Note: this is fired when a user uses the keyboard to make a selection and then hits “enter”
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    props.handleSelectClick(selection);

    setSearchText('');
  };

  // In most cases, search will be expensive so we wait 1s for the user to stop typing.
  const handleInputChange = (value: string): void | Function => {
    // Ensure that two-letter names are not ignored
    const inputLength = mode === 'group' ? 2 : 1;

    setSearchText(value);

    if (value.length > inputLength) {
      const timeout = setTimeout(() => handleFetch(value), fetchDelay);

      return () => clearTimeout(timeout);
    }
  };

  function handleFetch(value: string): void {
    if (view === 'initial') {
      props.handleFetch(value, null).then(result => setSearchResults(result));
    } else {
      props
        .handleFetch(value, props.selectedItem as Person | Group)
        .then(result => setSearchResults(result));
    }
  }

  // Clear typed input and suggestions if search type changes.
  useEffect(() => {
    setSearchText('');
    setSearchResults([]);
  }, [mode, view]);

  useEffect(() => {
    // Clear selected item if search text has been changed.
    if (searchText !== selection.displayName) {
      setSelection({} as Group);
    }
  }, [searchText]);

  return (
    <Section>
      <SectionHeader title={textCopy[view][mode].title} />

      <form>
        <div role="search">
          <label htmlFor={inputId} className="txt-l">
            {textCopy[view][mode].label}
          </label>

          {/*{!searchResponse.response && <span>Loading...</span>}*/}

          <div css={INPUTS_STYLING}>
            <AutosuggestWrapper
              id={inputId}
              placeholder={`Search by ${
                mode === 'person' ? 'name or ID' : 'group name'
              }`}
              onChange={handleInputChange}
              searchText={searchText}
              searchResults={searchResults}
              setSelection={setSelection}
            />

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

const INPUTS_STYLING = css({
  display: 'flex',
  'div[role="combobox"]': {
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
