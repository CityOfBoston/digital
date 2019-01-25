import React from 'react';

import { css } from 'emotion';

import { CHARLES_BLUE } from '@cityofboston/react-fleet';

export default function IdIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 147 97"
      className={ICON_STYLING}
    >
      <rect x="2" y="2" width="143" height="93" />

      <g className="lines">
        <line x1="77" y1="16.3" x2="132" y2="16.3" />
        <line x1="77" y1="31.8" x2="132" y2="31.8" />
        <line x1="77" y1="47.2" x2="132" y2="47.2" />
        <line x1="77" y1="62.6" x2="132" y2="62.6" />
        <line x1="77" y1="78" x2="132" y2="78" />
      </g>

      <g transform="translate(-372 -956)">
        <rect
          width="44.77"
          height="61.84"
          transform="translate(387.132 972.347)"
        />
        <path
          d="M54.251,75.36H42.437L34.05,81.983v22.79H62.587V82.239Z"
          transform="translate(361.199 929.414)"
        />
        <circle
          cx="7.575"
          cy="7.575"
          r="7.575"
          transform="translate(401.691 984.277)"
        />
      </g>
    </svg>
  );
}

const ICON_STYLING = css({
  fill: '#fff',
  color: CHARLES_BLUE,
  stroke: 'currentColor',
  strokeWidth: 3,

  '.lines': {
    strokeWidth: 3.75,
  },
});
