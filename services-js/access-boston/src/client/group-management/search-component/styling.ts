/** @jsx jsx */

import { css } from '@emotion/core';
import {
  FREEDOM_RED_DARK,
  OPTIMISTIC_BLUE_DARK,
  SANS,
} from '@cityofboston/react-fleet';

export const FIELD_CONTAINER_STYLING = css({
  position: 'relative',

  li: {
    marginBottom: 0,
  },

  '.status': {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '1rem',

    display: 'flex',

    fontFamily: SANS,
  },

  '.no-results': {
    color: FREEDOM_RED_DARK,
  },

  '.working': {
    color: OPTIMISTIC_BLUE_DARK,
  },
});

export const INPUTS_STYLING = css({
  display: 'flex',

  '> div': {
    width: '100%',
  },

  button: {
    marginLeft: '0.5em',
    flexShrink: 0,
  },

  'input[type="search"]': {
    '&::-webkit-search-cancel-button': {
      WebkitAppearance: 'none',
    },
    '&::-webkit-calendar-picker-indicator': {
      display: 'none',
    },
  },
});
