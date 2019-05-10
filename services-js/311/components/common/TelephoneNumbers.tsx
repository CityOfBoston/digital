import React from 'react';
import { css } from 'emotion';

import { MEDIA_LARGE } from '@cityofboston/react-fleet';

import { assetUrl } from '../style-constants';

const SPRITE_URL = assetUrl('img/svg/faq-icons.svg');

const CONTAINER_STYLE = css({
  display: 'flex',
  alignItems: 'center',
});

const TELEPHONE_STYLE = css({
  display: 'none',
  width: 36,
  height: 36,
  marginRight: '1rem',
  [MEDIA_LARGE]: {
    display: 'block',
  },
});

// This has to work against white and yellow backgrounds, so we inherit the text
// color to avoid dealing with optimistic blue on yellow. The underline makes it
// clear that it’s a link.
const TELEPHONE_LINK_STYLE = css({
  color: 'inherit',
  textDecoration: 'underline',
  whiteSpace: 'nowrap',
});

/**
 * Component that adds a little telephone icon and information about how to call
 * BOS:311 when the website is having issues.
 */
export default function TelephoneNumbers(): JSX.Element {
  return (
    <div className={CONTAINER_STYLE}>
      <svg aria-hidden className={TELEPHONE_STYLE}>
        <use xlinkHref={`${SPRITE_URL}#Phone_off`} height="36" />
      </svg>

      <div className="t--info">
        You can always report non-emergency issues to us by calling BOS:311 at
        311 or{' '}
        <a href="tel:+16176354500" className={TELEPHONE_LINK_STYLE}>
          617-635-4500
        </a>
        .
      </div>
    </div>
  );
}
