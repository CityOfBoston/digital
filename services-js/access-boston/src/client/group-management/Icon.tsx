/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { BLACK, WHITE } from '@cityofboston/react-fleet';

interface Props {
  type: 'group' | 'person';
  size: 'large' | 'small';
}

/**
 * type:
 * “group” - three figures
 * “person” - single figure, centered
 *
 * size:
 * “large” - larger, no border; to be displayed on InitialView
 * “small” - circular border; to be displayed by SelectedComponent
 */
export default function Icon(props: Props) {
  const dimensions = props.size === 'large' ? 200 : 70;

  return (
    <svg
      viewBox="0 0 138 68.5"
      aria-hidden="true"
      focusable="false"
      height={dimensions}
      width={dimensions}
      css={STYLING}
      transform={props.size === 'large' ? 'scale(0.5)' : ''}
    >
      {props.size === 'small' && (
        <circle
          cx="69"
          cy="34.25"
          r="65"
          fill={WHITE}
          stroke={BLACK}
          strokeWidth={5}
        />
      )}

      <g transform="translate(-69, -34.25)">
        {props.type === 'group' && (
          <g>
            <path d="M119.53 60.99h-15.66l-11.13 8.42v28.9h37.84V69.73l-11.05-8.74z" />
            <circle cx="111.32" cy="43.87" r="10.04" />

            <path d="M172.21 60.99h-15.66l-11.13 8.42v28.9h37.84V69.73l-11.05-8.74z" />
            <circle cx="164.01" cy="43.87" r="10.04" />
          </g>
        )}

        <g transform={props.type === 'person' ? 'translate(0, -8)' : ''}>
          <path d="M145.87 71.12h-15.66l-11.13 8.41v28.91h37.84V79.86l-11.05-8.74z" />
          <circle cx="137.66" cy="54" r="10.04" />
        </g>
      </g>
    </svg>
  );
}

const STYLING = css({
  'path, g > circle': {
    fill: WHITE,
    stroke: BLACK,
    strokeLinecap: 'round',
    strokeWidth: 3,
    padding: '5rem',
  },
});
