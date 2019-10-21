/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { useState } from 'react';

import { SANS } from '@cityofboston/react-fleet';

import { Group, Person, Mode, View } from './types';

import StatusModal from '../StatusModal';

import Section from './Section';
import SelectedComponent from './SelectedComponent';
import ReviewList from './list-components/ReviewList';
import { updateGroup } from './data-fetching/fetch-group-data';

interface Props {
  mode: Mode;
  selected: Group | Person;
  changeView: (view: View) => void;
  resetAll: () => void;
  items: Array<Group | Person>;
  submitting?: boolean;
  dns?: Array<string>;
}

export default function ReviewChangesView(props: Props) {
  const [submitting, setSubmitting] = useState<boolean>(
    props.submitting || false
  );
  const { items, mode, selected, dns } = props;
  const internalMode = mode === 'person' ? 'group' : 'person';

  const addedItems = items.filter(item => item.status === 'add') || [];
  const removedItems = items.filter(item => item.status === 'remove') || [];
  // console.log('addedItems: ', addedItems);
  // console.log('removedItems: ', removedItems);
  // console.log('props: ', props);

  const renderSubmitting = () => {
    return (
      <StatusModal>
        <div css={MODAL_STYLING}>Submitting changes...</div>
      </StatusModal>
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    // todo: send mutation query to api
    // todo: need interface

    // todo: replace  with something to listen for successful server response
    setTimeout(() => {
      setSubmitting(false);
      props.resetAll();
    }, 1700);

    const changesArr = [...addedItems, ...removedItems];
    // eslint-disable-next-line no-console
    console.log('changesArr: ', changesArr);
    try {
      // eslint-disable-next-line no-console
      console.log('promising ...', dns, selected.dn);
      const promises = changesArr.map(entry => {
        updateGroup(selected.dn, entry.status, entry.dn, dns);
      });

      await Promise.all(promises);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Submit Changes (Error): ', error);
    }

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
