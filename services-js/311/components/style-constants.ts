import getConfig from 'next/config';
import { css } from 'emotion';

export const MEDIA_SMALL = '@media screen and (min-width: 480px)';
export const MEDIA_MEDIUM = '@media screen and (min-width: 768px)';
export const MEDIA_LARGE = '@media screen and (min-width: 840px)';
export const MEDIA_LARGE_MAX = '@media screen and (max-width: 839px)';
export const MEDIA_X_LARGE = '@media screen and (min-width: 980px)';
export const MEDIA_XX_LARGE = '@media screen and (min-width: 1280px)';

export const HEADER_HEIGHT = 119;
export const IPHONE_FOOTER_HEIGHT = 64;

export const YELLOW = '#fcb61a';
export const GREEN = '#62A744';
export const CHARLES_BLUE = '#091f2f';
export const GRAY_000 = '#f3f3f3';
export const GRAY_100 = '#e0e0e0';
export const GRAY_200 = '#aaa';
export const GRAY_300 = '#828282';

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
