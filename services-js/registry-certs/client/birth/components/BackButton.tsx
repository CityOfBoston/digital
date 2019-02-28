import React, { MouseEvent } from 'react';

import { css } from 'emotion';

interface Props {
  handleClick: (ev: MouseEvent) => void;
}

/**
 * “Back” button that looks like a text link. Container div provides padding
 * to match that of the “next” button.
 */
export default function BackButton(props: Props): JSX.Element {
  return (
    <div className={BACK_BUTTON_CONTAINER_STYLING}>
      <button type="button" className="lnk" onClick={props.handleClick}>
        <BackButtonContent />
      </button>
    </div>
  );
}

export function BackButtonContent(): JSX.Element {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span aria-hidden="true">←</span> Back
    </span>
  );
}

const BACK_BUTTON_CONTAINER_STYLING = css({
  fontStyle: 'italic',
  button: {
    padding: '1.25rem',
  },
});
