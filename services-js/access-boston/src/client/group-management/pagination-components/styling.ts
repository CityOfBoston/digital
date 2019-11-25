import { css } from '@emotion/core';
import {
  OPTIMISTIC_BLUE_DARK,
  CHARLES_BLUE,
  WHITE,
  FREEDOM_RED_DARK,
  DEFAULT_TEXT,
  GRAY_300,
} from '@cityofboston/react-fleet';

export const PAGINATION = css({
  marginBottom: '2.5em',
  fontWeight: 'normal',

  a: {
    cursor: 'pointer',
  },

  '&:hover': {
    color: WHITE,
  },

  'li span': {
    color: WHITE,
  },

  'span.pg-li-i': {
    borderColor: CHARLES_BLUE,
    color: DEFAULT_TEXT,
  },

  'a.pg-li-i--a': {
    backgroundColor: OPTIMISTIC_BLUE_DARK,
    color: WHITE,
  },

  '.last-li': {
    borderColor: DEFAULT_TEXT,
  },

  'a.last-link': {
    cursor: 'initial',
    color: GRAY_300,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: GRAY_300,
    borderLeftColor: CHARLES_BLUE,
  },

  '.prev-next:hover': {
    backgroundColor: FREEDOM_RED_DARK,
  },

  '.prev-next a:hover': {
    backgroundColor: FREEDOM_RED_DARK,
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
    backgroundColor: FREEDOM_RED_DARK,
    color: WHITE,
    opacity: 1,
  },
});
