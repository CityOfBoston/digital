/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { FREEDOM_RED_DARK } from '../../utilities/constants';

const STYLES = css`
  border: none;
  background-color: transparent;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;

const DEFAULT_SIZE = '48px';

interface Props {
  size?: string;
  title?: string;
  className?: string;
  handleClick: any;
}

export default function CloseButton(props: Props): JSX.Element {
  const size = props.size || DEFAULT_SIZE;

  return (
    <button
      type="button"
      title={props.title || 'Close'}
      onClick={props.handleClick}
      className={props.className}
      css={STYLES}
      style={{
        width: size,
        height: size,
        overflow: 'visible',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        overflow="visible"
        aria-hidden="true"
        width={size}
        height={size}
      >
        <circle cx="12" cy="12" r="12" stroke="none" fill={FREEDOM_RED_DARK} />

        <g transform="rotate(45, 12, 12)">
          <line
            x1="12"
            y1="4"
            x2="12"
            y2="20"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="4"
            y1="12"
            x2="20"
            y2="12"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </button>
  );
}
