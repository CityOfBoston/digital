/** @jsx jsx */

import { css } from '@emotion/core';
import {
  FREEDOM_RED_DARK,
  OPTIMISTIC_BLUE_DARK,
  SANS,
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
