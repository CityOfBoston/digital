/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MouseEvent } from 'react';

interface Props {
  handleClick: (ev: MouseEvent) => void;
}

/**
 * “Back” button that looks like a text link. Right padding added to increase
 * touch target size.
 */
export default function BackButton(props: Props): JSX.Element {
  return (
    <button
      type="button"
      className="lnk"
      css={BACK_BUTTON_STYLING}
      onClick={props.handleClick}
    >
      <BackButtonContent />
    </button>
  );
}

export function BackButtonContent(): JSX.Element {
  return (
    <span style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }}>
      <span aria-hidden="true" style={{ fontStyle: 'normal' }}>
        ←
      </span>{' '}
      Back
    </span>
  );
}

const BACK_BUTTON_STYLING = css({
  padding: '1.25rem !important',
  paddingLeft: '0 !important',
});
