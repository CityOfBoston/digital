/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Group, Mode, Person } from '../types';

import ListItemComponent from './ListItemComponent';

import { LIST_STYLING } from './styling';

interface Props {
  mode: Mode;
  items: Array<Group | Person>;
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

  return (
    <ul css={LIST_STYLING}>
      {props.items &&
        props.items.map(item => (
          <ListItemComponent
            key={item.displayName}
            handleChange={() => props.handleChange(item)}
            handleClick={handleClick}
            isChecked={item.status !== 'remove'}
            item={item}
          />
        ))}
      {/*{props.items.map(item => (*/}
      {/*  <ListItemComponent*/}
      {/*    key={item.displayName}*/}
      {/*    handleChange={() => props.handleChange(item)}*/}
      {/*    handleClick={handleClick}*/}
      {/*    isChecked={item.status !== 'remove'}*/}
      {/*    item={item}*/}
      {/*  />*/}
      {/*))}*/}
      {/*{props.items.map(item => (*/}
      {/*<ListItemComponent*/}
      {/*  key={item.displayName}*/}
      {/*  handleChange={() => props.handleChange(item)}*/}
      {/*  handleClick={handleClick}*/}
      {/*  isChecked={item.status !== 'remove'}*/}
      {/*  item={item}*/}
      {/*/>*/}
      {/*))}*/}
    </ul>
  );
}
