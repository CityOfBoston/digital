/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, ReactNode } from 'react';

import {
  OPTIMISTIC_BLUE_DARK,
  VISUALLY_HIDDEN,
  WHITE,
  SectionHeader,
} from '@cityofboston/react-fleet';

import { capitalize } from '../utility';

import { Mode } from './types';

import Section from './Section';

import Icon from './Icon';
// import { Group, Person } from '../group-management/types';
import MinGroupDisplay from './MinGroupDisplay';

interface Props {
  mode: Mode;
  changeMode: (mode: Mode) => void;
  searchComponent: ReactNode;
  adminMinGroups?: [];
  handleAdminGroupClick: (item: any) => void;
}

/**
 * The initial view of the Manage Groups application; provides user with
 * the option to perform an initial search by person, or by group.
 */
export default function InitialView(props: Props) {
  const { mode, changeMode, adminMinGroups } = props;
  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    changeMode(event.target.value as Mode);
  };
  const admin_groups: [] = adminMinGroups ? adminMinGroups : [];
  const showMinGroupDisplay =
    adminMinGroups &&
    adminMinGroups.length > 0 &&
    adminMinGroups.length < 4 &&
    mode === 'group';

  return (
    <>
      <Section isGray>
        <SectionHeader title="Do you want..." />

        <div role="radiogroup" css={SELECTION_CONTAINER_STYLING}>
          <SearchTypeOption
            searchTypeName="group"
            currentSelection={mode}
            handleChange={handleModeChange}
          >
            <span>
              <Icon type="group" size="large" />
            </span>
          </SearchTypeOption>

          <SearchTypeOption
            searchTypeName="person"
            currentSelection={mode}
            handleChange={handleModeChange}
          >
            <span>
              <Icon type="person" size="large" />
            </span>
          </SearchTypeOption>
        </div>
      </Section>

      {showMinGroupDisplay ? (
        <MinGroupDisplay
          groups={admin_groups}
          handleAdminGroupClick={props.handleAdminGroupClick}
        />
      ) : (
        <>{props.searchComponent}</>
      )}
    </>
  );
}

export function SearchTypeOption({
  searchTypeName,
  currentSelection,
  handleChange,
  children,
}) {
  return (
    <label>
      <input
        type="radio"
        name="searchType"
        value={searchTypeName}
        checked={currentSelection === searchTypeName}
        onChange={handleChange}
      />

      <figure css={FIGURE_STYLING}>
        <div>{children}</div>

        <figcaption>
          {searchTypeName === 'person' ? 'Person' : capitalize(searchTypeName)}
        </figcaption>
      </figure>
    </label>
  );
}

const OPACITY_STYLING = {
  DEFAULT: {
    opacity: 0.5,

    transition: 'opacity 0.15s',
  },

  SELECTED: {
    opacity: 1,
  },
};

const SELECTION_OPTION_STYLING = css({
  margin: '1rem',
  cursor: 'pointer',

  'input[type="radio"]': {
    '&:focus + figure': {
      '> div': {
        outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
        outlineOffset: '1px',
      },
    },
    '&:checked + figure': {
      '> div > *, figcaption': {
        ...OPACITY_STYLING.SELECTED,
      },
    },
  },
});

const FIGURE_STYLING = css({
  margin: 0,
  textAlign: 'center',

  figcaption: {
    marginTop: '1rem',
    fontStyle: 'italic',
    fontSize: '1.25rem',
    color: OPTIMISTIC_BLUE_DARK,
    ...OPACITY_STYLING.DEFAULT,
  },

  '> div': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    height: '150px',
    width: '150px',
    backgroundColor: WHITE,

    '> *': {
      ...OPACITY_STYLING.DEFAULT,
    },
  },
});

const SELECTION_CONTAINER_STYLING = css({
  display: 'flex',
  alignContent: 'center',
  justifyContent: 'center',
  border: 0,

  input: VISUALLY_HIDDEN,
  label: SELECTION_OPTION_STYLING,
});
