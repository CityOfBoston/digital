import getConfig from 'next/config';
import { css } from 'emotion';

import { MEDIA_LARGE } from '@cityofboston/react-fleet';

export const NAV_HEIGHT = 54;
export const GRAY_200 = '#aaa';

// Puts a little spacing around the dialog, which has auto left/right margins.
// Lets the map show through on large screens.
//
// We used to try and vertically center by making this element flex: 1 to grow
// it to the main content container's height, but IE won't then let content
// larger than that size grow this container.
export const CENTERED_DIALOG_STYLE = css({
  [MEDIA_LARGE]: {
    padding: '0 40px',
  },
});

export const CLEAR_FIX = css({
  '::after': {
    content: '""',
    display: 'table',
    clear: 'both',
  },
});

export function assetUrl(path: string): string {
  const config = getConfig();
  const assetPrefix = config ? config.publicRuntimeConfig.assetPrefix : '';

  return `${assetPrefix}/assets/${path}`;
}
