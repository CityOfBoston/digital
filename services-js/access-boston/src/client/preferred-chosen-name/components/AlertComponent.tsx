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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" css={ICON_STYLING}>
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#00A91C"/>
        </svg>
      </div>
      <div css={TEXT_CONTAINER_STYLING}>{text}</div>
    </div>
  );
}

const ALERT_CONTAINER_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 40px 16px 30px',
  backgroundColor: '#ecf3ec',
  borderLeft: '10px solid #00a91c',
  color: '#000000',
  width: '100%',
  lineHeight: '1.5rem',
  borderRadius: '0px',

  '@media (max-width: 600px)': {
    alignItems: 'start',
    padding: '10px'

  },
});

const ICON_CONTAINER_STYLING = css({
  marginRight: '16px',
  display: 'flex',

  '@media (max-width: 600px)': {
    marginRight: '8px',
    padding: '2px'
  },
});

const ICON_STYLING = css({
  width: '32px',
  height: '32px',

  '@media (max-width: 600px)': {
    width: '20px',
    height: '20px',
  },
});

const TEXT_CONTAINER_STYLING = css({
  flex: 1,
});