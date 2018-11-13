// @flow

import { css } from 'glamor';

export const MEDIA_SMALL = '@media screen and (min-width: 480px)';
export const MEDIA_MEDIUM = '@media screen and (min-width: 768px)';
export const MEDIA_LARGE = '@media screen and (min-width: 840px)';
export const MEDIA_LARGE_MAX = '@media screen and (max-width: 840px)';
export const MEDIA_X_LARGE = '@media screen and (min-width: 980px)';
export const MEDIA_XX_LARGE = '@media screen and (min-width: 1280px)';

export const HEADER_HEIGHT = 119;
export const IPHONE_FOOTER_HEIGHT = 64;

export const YELLOW = '#fcb61a';
export const GREEN = '#62A744';
export const GRAY_000 = '#f3f3f3';
export const GRAY_100 = '#e0e0e0';
export const GRAY_300 = '#828282';

// Puts a little spacing around the dialog, which has auto left/right margins.
// Lets the map show through on large screens.
export const CENTERED_DIALOG_STYLE = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'space-around',

  [MEDIA_LARGE]: {
    padding: '0 40px',
  },
});
