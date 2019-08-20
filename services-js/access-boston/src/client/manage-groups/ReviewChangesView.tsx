/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Group, Person, Mode, View } from './types';

import Section from './Section';
import SelectedComponent from './SelectedComponent';
import ReviewList from './list-components/ReviewList';

interface Props {
  mode: Mode;
  selected: Group | Person;
  changeView: (view: View) => void;
  items: Array<Group | Person>;
}

export default function ReviewChangesView(props: Props) {
  const { items, mode, selected } = props;

  const internalMode = mode === 'person' ? 'group' : 'person';

  const addedItems = items.filter(item => item.status === 'add') || [];
  const removedItems = items.filter(item => item.status === 'remove') || [];

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

          <button type="button" className="btn">
            Submit
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
