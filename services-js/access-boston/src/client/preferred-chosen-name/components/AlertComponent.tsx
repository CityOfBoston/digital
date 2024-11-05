/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { ReactNode } from 'react';

interface AlertProps {
  text: ReactNode;
}

/**
 * AlertComponent to display a success message with a left-aligned icon and message text.
 */
export default function AlertComponent({ text }: AlertProps): JSX.Element {
  return (
    <div css={ALERT_CONTAINER_STYLING}>
      <div css={ICON_CONTAINER_STYLING}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="36"
          height="36"
          css={ICON_STYLING}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
      </div>
      <div css={TEXT_CONTAINER_STYLING}>{text}</div>
    </div>
  );
}

const ALERT_CONTAINER_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: '#ecf3ec',
  borderLeft: '10px solid #00a91c',
  color: '#000000',
  width: '100%',
  height: '50px',
  lineHeight: '1.5rem',
  borderRadius: '0px',
});

const ICON_CONTAINER_STYLING = css({
  marginRight: '16px',
  display: 'flex',
  alignItems: 'center',
});

const ICON_STYLING = css({
  color: '#4CAF50',
  width: '32px',
  height: '32px',
});

const TEXT_CONTAINER_STYLING = css({
  flex: 1
});
