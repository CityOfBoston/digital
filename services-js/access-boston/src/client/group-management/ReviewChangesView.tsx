/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { useState } from 'react';

import { SANS } from '@cityofboston/react-fleet';

import { Group, Person, Mode, View } from './types';

import StatusModal from '../StatusModal';

import Section from './Section';
import SelectedComponent from './SelectedComponent';
import ReviewList from './list-components/ReviewList';

interface Props {
  mode: Mode;
  selected: Group | Person;
  changeView: (view: View) => void;
  resetAll: () => void;
  items: Array<Group | Person>;
  submitting?: boolean;
}

export default function ReviewChangesView(props: Props) {
  const [submitting, setSubmitting] = useState<boolean>(
    props.submitting || false
  );
  const { items, mode, selected } = props;

  const internalMode = mode === 'person' ? 'group' : 'person';

  const addedItems = items.filter(item => item.status === 'add') || [];
  const removedItems = items.filter(item => item.status === 'remove') || [];

  const renderSubmitting = () => {
    return (
      <StatusModal>
        <div css={MODAL_STYLING}>Submitting changes...</div>
      </StatusModal>
    );
  };

  const handleSubmit = () => {
    setSubmitting(true);

    // todo: send mutation query to api
    // todo: need interface

    // todo: replace  with something to listen for successful server response
    setTimeout(() => {
      setSubmitting(false);
      props.resetAll();
    }, 1700);

    // todo: handle error state (print error to modal?)
  };

  return (
    <>
      <SelectedComponent mode={mode} selected={selected} />

      <Section aria-label="Review changes" stretch>
        {addedItems.length > 0 && (
          <ReviewList mode={internalMode} items={addedItems} status="add" />
        )}

        {removedItems.length > 0 && (
          <ReviewList
            mode={internalMode}
            items={removedItems}
            status="remove"
          />
        )}

        <div css={BUTTON_CONTAINER_STYLING}>
          <button
            type="button"
            className="btn"
            onClick={() => props.changeView('management')}
          >
            Go back
          </button>

          <button type="button" className="btn" onClick={handleSubmit}>
            Submit
          </button>

          {submitting && renderSubmitting()}
        </div>
      </Section>
    </>
  );
}

const BUTTON_CONTAINER_STYLING = css({
  display: 'flex',
  justifyContent: 'space-between',
});

const MODAL_STYLING = css({
  fontFamily: SANS,
});
