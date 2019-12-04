/** @jsx jsx */

import { css, jsx } from '@emotion/core';

// import { useState } from 'react';

// import { SANS } from '@cityofboston/react-fleet';

import { Group, Person, Mode, View } from './types';

// import StatusModal from '../StatusModal';

import Section from './Section';
import SelectedComponent from './SelectedComponent';
import ReviewList from './list-components/ReviewList';
import { SectionHeader } from '@cityofboston/react-fleet';

interface Props {
  mode: Mode;
  selected: Group | Person;
  changeView: (view: View) => void;
  resetAll: () => void;
  items: Array<Group | Person>;
}

export default function ReviewConfirmationView(props: Props) {
  // const [submitting, setSubmitting] = useState<boolean>(
  //   props.submitting || false
  // );
  const { items, mode, selected } = props;
  const internalMode = mode === 'person' ? 'group' : 'person';

  const addedItems = items.filter(item => item.status === 'add') || [];
  const removedItems = items.filter(item => item.status === 'remove') || [];
  const handleSubmit = async () => {
    props.resetAll();
  };

  return (
    <>
      <SelectedComponent mode={mode} selected={selected} />

      <Section aria-label="Confirmation" stretch>
        <SectionHeader title={`Confirmation`} css={MAIN_HEADER_STYLING} />

        {addedItems.length > 0 && (
          <ReviewList
            mode={internalMode}
            items={addedItems}
            status="add"
            subheader={true}
          />
        )}

        {removedItems.length > 0 && (
          <ReviewList
            mode={internalMode}
            items={removedItems}
            status="remove"
            subheader={true}
          />
        )}

        <div css={BUTTON_CONTAINER_STYLING}>
          <button type="button" className="btn" onClick={handleSubmit}>
            Close
          </button>
        </div>
      </Section>
    </>
  );
}

const BUTTON_CONTAINER_STYLING = css({
  display: 'flex',
  justifyContent: 'space-between',
});

const MAIN_HEADER_STYLING = css({
  marginBottom: '2em',
});
