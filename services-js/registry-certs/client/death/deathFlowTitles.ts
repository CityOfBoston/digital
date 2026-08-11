import { css } from '@emotion/core';

import {
  CHARLES_BLUE,
  MEDIA_SMALL_MAX,
  SANS,
} from '@cityofboston/react-fleet';

/**
 * Death flow “app” title (“Request a death certificate”).
 * Matches birth `sh-title` sizing: 20px on mobile, 2rem above.
 */
export const DEATH_APP_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '2rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',

  [MEDIA_SMALL_MAX]: {
    fontSize: '20px',
  },
});

/**
 * Death flow page/step title below the progress bar.
 * 24px on mobile to match birth section headings.
 */
export const DEATH_PAGE_TITLE_STYLING = css({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: '1.875rem',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: CHARLES_BLUE,
  margin: '0 0 1.5rem',

  [MEDIA_SMALL_MAX]: {
    fontSize: '24px',
  },
});
