/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ReactNode } from 'react';

import { SectionHeader } from '@cityofboston/react-fleet';

import { Group, Mode, Person, View } from './types';

import Section from './Section';
import SelectedComponent from './SelectedComponent';

interface Props {
  list: any;
  mode: Mode;
  selected: Group | Person;
  changeView: (view: View) => void;
  searchComponent: ReactNode;
  editableList: ReactNode;
}

/**
 * View to see and edit the groups an person belongs to, or a group’s membership.
 *
 * should fetch relevant members or groups from itemDetails object on mount and store as currentList
 *
 */
export default function ManagementView(props: Props) {
  const { mode, selected, list } = props;

  // // const titleText: string = displayName || cn;
  // const a11yLabel =
  //   mode === 'person' ? { ariaLabel: 'Selected staffer' } : {};

  const addedItems = list.filter(item => item.status === 'add') || [];
  const removedItems = list.filter(item => item.status === 'remove') || [];

  const canProceed: boolean = addedItems.length > 0 || removedItems.length > 0;

  return (
    <>
      <SelectedComponent mode={mode} selected={selected} />

      {props.searchComponent}

      <Section isGray stretch>
        <SectionHeader
          title={`Current ${mode === 'person' ? 'groups' : 'members'}`}
        />

        {props.editableList}

        <div css={BUTTON_CONTAINER_STYLING}>
          <button
            type="button"
            className="btn"
            onClick={() => props.changeView('review')}
            disabled={!canProceed}
          >
            Review changes
          </button>
        </div>
      </Section>
    </>
  );
}

const BUTTON_CONTAINER_STYLING = css({
  textAlign: 'right',
});
