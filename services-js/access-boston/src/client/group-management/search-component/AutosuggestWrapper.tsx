/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component } from 'react';

import Autosuggest from 'react-autosuggest';

import {
  BLACK,
  DEFAULT_TEXT,
  GRAY_100,
  WHITE,
} from '@cityofboston/react-fleet';

import { Group, Person } from '../types';

interface Props {
  id: string;
  placeholder?: string;
  searchText: string;
  searchResults: Array<Group | Person>;
  onChange: (value: string) => void;
  onSuggestionSelected: (
    selection: Group | Person,
    selectionValue: string
  ) => void;
}

/**
 * Wrapper component for Autosuggest package; because we will be filtering
 * at a service level, we are mostly using it for its functionality at this
 * time. -jm 9/16/19
 *
 * https://github.com/moroshko/react-autosuggest
 */
export default class AutosuggestWrapper extends Component<Props> {
  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValue = (suggestion: Group | Person): string => {
    return suggestion.displayName || suggestion.cn;
  };

  // input handler
  onChange = (_event, { newValue }): void => {
    this.props.onChange(newValue);
  };

  handleSuggestion = (_event, { suggestion, suggestionValue }): void => {
    this.props.onSuggestionSelected(suggestion, suggestionValue);
  };

  render() {
    const suggestions = this.props.searchResults || [];

    const inputProps = {
      placeholder: this.props.placeholder,
      value: this.props.searchText,
      onChange: this.onChange,
    };

    return (
      <Autosuggest
        id={this.props.id}
        suggestions={suggestions}
        onSuggestionSelected={this.handleSuggestion}
        onSuggestionsFetchRequested={() => {}}
        onSuggestionsClearRequested={() => {}}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        theme={AUTOSUGGEST_STYLING}
      />
    );
  }
}

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => {
  const { cn, displayName } = suggestion;

  if (displayName) {
    return (
      <div css={SUGGESTION_STYLING}>
        <span>{displayName}</span>

        {displayName !== cn && <span>{cn}</span>}
      </div>
    );
  } else {
    return <>{cn}</>;
  }
};

const SUGGESTION_STYLING = css({
  display: 'flex',
  justifyContent: 'space-between',

  'span:last-of-type': {
    color: DEFAULT_TEXT,
  },
});

const AUTOSUGGEST_STYLING = {
  input: 'txt-f',
  container: {
    position: 'relative',
  },
  suggestionsContainer: {
    zIndex: 1,
    position: 'absolute',
    minWidth: '50%',
  },
  suggestionsList: {
    position: 'relative',
    top: '-1px',
    left: '3px',
    margin: 0,
    padding: 0,
    color: BLACK,
    backgroundColor: WHITE,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    borderBottomLeftRadius: '0.2rem',
    borderBottomRightRadius: '0.2rem',
  },
  suggestion: {
    listStyle: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  suggestionHighlighted: {
    backgroundColor: GRAY_100,
  },
};
