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
  dns?: [String];
  getAdminMinGroups?: () => void | {};
}

export default function ReviewChangesView(props: Props) {
  const [submitting, setSubmitting] = useState<boolean>(
    props.submitting || false
  );
  const { items, mode, selected, dns, getAdminMinGroups } = props;
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

  const getAdmin_MinGroups = () => {
    getAdminMinGroups ? getAdminMinGroups() : () => {};
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const changesArr = [...addedItems, ...removedItems];
    try {
      const promises = changesArr.map(entry => {
        const _mode = mode === 'person';
        const updateParams: any = {
          dn: _mode ? entry.dn : selected.dn,
          cn: _mode ? selected.dn : entry.dn,
        };
        const operation =
          entry.status === 'current' || entry.status === 'remove'
            ? 'delete'
            : entry.status;
        return updateGroup(updateParams.dn, operation, updateParams.cn, dns);
      });
      await Promise.all(promises).then(() => {
        getAdmin_MinGroups();
        setTimeout(() => {
          setSubmitting(false);
          props.changeView('confirmation');
        }, 1500);
      });
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
            Back
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
