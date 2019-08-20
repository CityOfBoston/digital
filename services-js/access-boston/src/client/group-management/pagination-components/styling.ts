import { css } from '@emotion/core';
import {
  OPTIMISTIC_BLUE_DARK,
  CHARLES_BLUE,
  WHITE,
} from '@cityofboston/react-fleet';

export const PAGINATION = css({
  marginBottom: '2.5em',

  a: {
    cursor: 'pointer',
  },

  'li span:hover': {
    color: CHARLES_BLUE,
  },

  'a.pg-li-i--a': {
    backgroundColor: OPTIMISTIC_BLUE_DARK,
  },
});

export const NORM_HOVER = css({
  a: {
    opacity: 1,
    borderColor: CHARLES_BLUE,
  },
});

export const HOVER_STYLES = css({
  a: {
    backgroundColor: OPTIMISTIC_BLUE_DARK,
    color: WHITE,
  },
  '&:hover': {
    backgroundColor: OPTIMISTIC_BLUE_DARK,
    color: WHITE,
    opacity: 1,
  },
});
