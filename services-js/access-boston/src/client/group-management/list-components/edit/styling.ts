/** @jsx jsx */

import { css } from '@emotion/core';
import {
  FREEDOM_RED_DARK,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  BLACK,
  GRAY_000,
  GRAY_100,
  GRAY_200,
  OPTIMISTIC_BLUE_LIGHT,
  WHITE,
} from '@cityofboston/react-fleet';

export const LOADER_STYLING = css({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '3rem',
  color: OPTIMISTIC_BLUE_DARK,
});

export const NO_RESULTS_STYLING = css({
  fontFamily: SANS,
  color: FREEDOM_RED_DARK,
});

export const LIST_STYLING = {
  listStyle: 'none',
  paddingLeft: 0,
  paddingBottom: '0.75rem',
  flexGrow: 1,
};

export const LIST_ITEM_STYLING = {
  listStyle: 'none',
  padding: '0.5em 1em',
  marginBottom: '0.75rem',
};

export const BUTTON_STYLING = css({
  color: OPTIMISTIC_BLUE_DARK,
  textDecoration: 'none',
  cursor: 'pointer',
});

export const REVIEW_LIST_ITEM_STYLING = css({
  backgroundColor: GRAY_000,
});

export const EDITABLE_LIST_ITEM_STYLING = css({
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

export const ADDED_STYLING = css({
  outline: `2px solid ${OPTIMISTIC_BLUE_LIGHT}`,
  outlineOffset: '-2px',
});
