/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import {
  FREEDOM_RED_DARK,
  OPTIMISTIC_BLUE_DARK,
  SANS,
} from '@cityofboston/react-fleet';

import { Group, Mode, Person } from '../types';

import Spinner from '../Spinner';
import ListItemComponent from './ListItemComponent';

import { LIST_STYLING } from './styling';
import { chunkArray } from '../fixtures/helpers';

interface Props {
  mode: Mode;
  items: Array<Group | Person>;
  loading?: boolean;
  handleChange: (item: Group | Person) => void;
  handleClick?: (item: Group | Person) => void;
}

/**
 * Component to display an editable list of groups, or list of people
 * (referred to as “items”). Items will contain clickable display text, and
 * a checked box.
 *
 * A checked checkbox indicates an item is a member of the given list. If an
 * item is displayed that represents a value the user does not have permission
 * to change, the checked box is disabled. Unchecking the box will remove that
 * item from the list.
 *
 * editableList reflects the current state of the user’s intended edits.
 */
export default function EditableList(props: Props) {
  const handleClick = (item: Group | Person): void => {
    if (props.handleClick) props.handleClick(item);
  };

  const noResultsText =
    props.mode === 'group'
      ? 'This group has no members'
      : 'This person hasn’t been added to any groups';

  if (props.loading === true) {
    return (
      <div css={LOADER_STYLING}>
        <Spinner size="3rem" />
      </div>
    );
  } else {
    // console.log('EditableList props.items: ', props.items);
    const pageSize: number = 100;
    let itemsList: any = chunkArray(props.items, pageSize);
    let page: number = 1;
    let items_list = props.items;

    if (
      !props.loading &&
      props.items.length > 0 &&
      props.items.length > pageSize
    ) {
      items_list = itemsList[page];
      // eslint-disable-next-line no-console
      console.log('items_list: ', ' | page: ', page, ' | list: ', items_list);
    }

    return (
      <ul css={LIST_STYLING}>
        {items_list && items_list.length > 0 ? (
          items_list.map(item => (
            <ListItemComponent
              key={item.displayName}
              view="management"
              handleChange={() => props.handleChange(item)}
              handleClick={handleClick}
              isChecked={item.status !== 'remove'}
              item={item}
            />
          ))
        ) : (
          <div css={NO_RESULTS_STYLING}>{noResultsText}</div>
        )}
      </ul>
    );
  }
}

const LOADER_STYLING = css({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '3rem',
  color: OPTIMISTIC_BLUE_DARK,
});

const NO_RESULTS_STYLING = css({
  fontFamily: SANS,
  color: FREEDOM_RED_DARK,
});
