/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import {
  BLACK,
  CLEAR_DEFAULT_STYLING,
  GRAY_000,
  GRAY_100,
  GRAY_200,
  OPTIMISTIC_BLUE_DARK,
  OPTIMISTIC_BLUE_LIGHT,
  WHITE,
} from '@cityofboston/react-fleet';

import { Group, Person, View } from '../types';

import { LIST_ITEM_STYLING } from './styling';

interface Props {
  item: Group | Person;
  view: View;
  isChecked?: boolean;
  handleChange?: () => void;
  handleClick?: (item: Group | Person) => void;
}

/**
 * A ListItem represents a group, or an person. If editable, it will also
 * have a checkbox. Checkbox may be disabled via canModify prop.
 */
export default function ListItemComponent(props: Props) {
  const {
    handleChange,
    handleClick,
    isChecked,
    item: { cn, displayName, isAvailable, status },
    view,
  } = props;

  const displayText = displayName || cn;
  const clickHandler = handleClick
    ? { onClick: () => handleClick(props.item) }
    : null;

  const displayElement = () => {
    if (isAvailable && view === 'management') {
      return (
        <span>
          <button
            type="button"
            css={[CLEAR_DEFAULT_STYLING.BUTTON, BUTTON_STYLING]}
            {...clickHandler}
          >
            {displayText}
          </button>
        </span>
      );
    } else {
      return <span>{displayText}</span>;
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
          disabled={!isAvailable}
          onChange={handleChange}
          checked={isChecked}
          id={`item-${displayText}`}
        />
        <label htmlFor={`item-${displayText}`}>{displayElement()}</label>
      </li>
    );
  } else {
    return (
      <li css={[LIST_ITEM_STYLING, REVIEW_LIST_ITEM_STYLING]}>
        {displayElement()}
      </li>
    );
  }
}

const BUTTON_STYLING = css({
  color: OPTIMISTIC_BLUE_DARK,
  textDecoration: 'none',
  cursor: 'pointer',
});

const REVIEW_LIST_ITEM_STYLING = css({
  backgroundColor: GRAY_000,
});

const EDITABLE_LIST_ITEM_STYLING = css({
  backgroundColor: WHITE,
  transition: 'background-color 0.2s',

  label: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    cursor: 'pointer',

    '&::before, &::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      right: 0,
      height: '1rem',
      width: '1rem',
    },

    '&::before': {
      border: `2px solid ${BLACK}`,
      backgroundColor: WHITE,
    },

    '&::after': {
      opacity: 0,
      backgroundImage:
        'url(https://patterns.boston.gov/images/public/icons/check.svg)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0% 50%',
      backgroundSize: '0.8em',
    },
  },

  'input[type="checkbox"]': {
    opacity: 0,
    position: 'absolute',
    height: 0,
    width: 0,
    margin: 0,

    '&:focus + label::before': {
      outline: `2px solid ${OPTIMISTIC_BLUE_DARK}`,
    },

    '&:checked + label::after': {
      opacity: 1,
    },

    '&:disabled + label': {
      cursor: 'default',

      '&::before, &::after': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },

      '&::before': {
        backgroundColor: GRAY_200,
      },
    },
  },

  '&.unchecked': {
    backgroundColor: GRAY_100,
  },
});

const ADDED_STYLING = css({
  outline: `2px solid ${OPTIMISTIC_BLUE_LIGHT}`,
  outlineOffset: '-2px',
});
