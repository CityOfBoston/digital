import { css } from '@emotion/core';

import {
  MEDIA_SMALL,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  WHITE,
} from '@cityofboston/react-fleet';

/** Shared height/padding so Back and Continue match. */
const CHECKOUT_ACTION_BUTTON_SIZE = {
  boxSizing: 'border-box' as const,
  minHeight: '55px',
  minWidth: '10rem',
  padding: '0.875rem 1.5rem',
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.2,
  textTransform: 'uppercase' as const,
};

/**
 * Checkout Back / Continue actions.
 * Mobile: stacked full-width, Back above Continue (DOM order).
 * Larger screens: Back left, Continue right.
 */
export const CHECKOUT_NAV_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem',

  [MEDIA_SMALL]: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: '1.5rem',
  },
});

export const CHECKOUT_NAV_BACK_STYLING = css({
  width: '100%',
  display: 'flex',

  'button, a': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...CHECKOUT_ACTION_BUTTON_SIZE,
  },

  [MEDIA_SMALL]: {
    width: 'auto',
    flex: '1 1 auto',
    minWidth: 0,

    'button, a': {
      width: 'auto',
      height: '100%',
    },
  },
});

export const CHECKOUT_NAV_NEXT_STYLING = css({
  width: '100%',
  display: 'flex',

  '.btn, button.btn': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...CHECKOUT_ACTION_BUTTON_SIZE,
    textAlign: 'center',
  },

  [MEDIA_SMALL]: {
    width: 'auto',
    flex: '0 0 auto',

    '.btn, button.btn': {
      width: 'auto',
      height: '100%',
    },
  },
});

/** Death checkout secondary back button (outline style). */
export const CHECKOUT_BACK_BUTTON_STYLING = css({
  appearance: 'none',
  background: WHITE,
  border: '1px solid #d2d2d2',
  color: OPTIMISTIC_BLUE_DARK,
  ...CHECKOUT_ACTION_BUTTON_SIZE,
  cursor: 'pointer',

  '&:hover, &:focus': {
    background: '#f3f3f3',
  },

  '&:focus': {
    outline: 'none',
  },

  '&:focus-visible': {
    outline: `3px solid ${OPTIMISTIC_BLUE_DARK}`,
    outlineOffset: '2px',
  },
});
