/** @jsx jsx */

import { jsx } from '@emotion/core';

import { CLEAR_DEFAULT_STYLING } from '@cityofboston/react-fleet';

import { Person, Group, View } from '../../types';
import {
  LIST_ITEM_STYLING,
  REVIEW_LIST_ITEM_STYLING,
  BUTTON_STYLING,
  ADDED_STYLING,
  EDITABLE_LIST_ITEM_STYLING,
} from './styling';

interface Props {
  item: Group | Person;
  mode: string;
  keyIndex: string | undefined;
  view: View;
  viewOnly: boolean;
  isChecked: boolean;
  handleChange: () => void;
  handleClick: (item: Group | Person) => void;
}

/**
 * A ListItem represents a group, or an person. If editable, it will also
 * have a checkbox. Checkbox may be disabled via canModify prop.
 */
export default function ListItemComponent(props: Props) {
  const {
    mode,
    item: { cn, displayName, isAvailable, status },
    item,
    keyIndex,
    view,
    viewOnly,
    isChecked,
    handleChange,
  } = props;

  let displayText = displayName || cn;
  if (mode && mode === 'group' && item['givenName'] && item['sn']) {
    const cobAgency = ` | ${item['cOBUserAgency']}`;
    displayText = `${item['givenName']} ${item['sn']}${cobAgency}`;
  }
  const displayElement = () => {
    if (isAvailable && view === 'management' && viewOnly === false) {
      return (
        <span key={`label_${keyIndex}`}>
          <button
            type="button"
            css={[CLEAR_DEFAULT_STYLING.BUTTON, BUTTON_STYLING]}
            // {...clickHandler}
          >
            {displayText}
          </button>
        </span>
      );
    } else {
      return <span key={`label_${keyIndex}`}>{displayText}</span>;
    }
  };

  if (handleChange) {
    return (
      <li
        className={`${isAvailable ? '' : 'disabled'} ${
          isChecked ? 'checked' : 'unchecked'
        }`}
        css={[
          LIST_ITEM_STYLING,
          EDITABLE_LIST_ITEM_STYLING,
          status === 'add' && ADDED_STYLING,
        ]}
      >
        <input
          type="checkbox"
          disabled={!isAvailable || viewOnly === true}
          onChange={handleChange}
          checked={isChecked}
          id={`item-${displayText}`}
        />
        <label htmlFor={`item-${displayText}`}>{displayElement()}</label>
      </li>
    );
  } else {
    return (
      <li
        key={`li_${keyIndex}`}
        css={[LIST_ITEM_STYLING, REVIEW_LIST_ITEM_STYLING]}
      >
        {displayElement()}
      </li>
    );
  }
}
