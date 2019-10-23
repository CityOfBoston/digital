/** @jsx jsx */

import { jsx } from '@emotion/core';

import { SectionHeader } from '@cityofboston/react-fleet';

import { capitalize } from '../../utility';

import { Group, ItemStatus, Mode, Person, ShowLabel } from '../types';

import { LIST_STYLING } from './styling';

import ListItemComponent from './ListItemComponent';

interface Props {
  mode: Mode;
  status: ItemStatus;
  items: Array<Group | Person>;
  showLabel?: ShowLabel;
  subheader?: Boolean;
}

/**
 * Displays a list of added or removed items; utilized by ReviewChangesView.
 */
export default function ReviewList(props: Props) {
  const { mode, status, showLabel, subheader } = props;

  const internalMode = mode === 'person' ? 'group' : 'person';
  const titleText = mode === 'person' ? 'members' : 'groups';
  const statusText = status === 'add' ? 'added' : 'removed';

  const id = `review-${internalMode}-${status}`;
  const ShowLabel = typeof showLabel === 'undefined' ? true : showLabel;
  const sub_header = subheader && subheader === true ? true : false;

  return (
    <>
      {ShowLabel && (
        <SectionHeader
          title={`${capitalize(titleText)} ${statusText}`}
          id={id}
          subheader={sub_header}
        />
      )}

      <ul css={LIST_STYLING} aria-labelledby={id}>
        {props.items.map(item => (
          <ListItemComponent key={item.cn} view="review" item={item} />
        ))}
      </ul>
    </>
  );
}
