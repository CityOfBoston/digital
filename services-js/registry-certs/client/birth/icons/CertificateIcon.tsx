/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { CHARLES_BLUE, WHITE } from '@cityofboston/react-fleet';

interface Props {
  name: 'birth' | 'id';
}

export default function CertificateIcon(props: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 147 97"
      aria-hidden="true"
      focusable="false"
      css={ICON_STYLING}
    >
      <rect x="2" y="2" width="143" height="93" className="frame" />

      <g className="lines">
        <line x1="77" y1="16.3" x2="132" y2="16.3" />
        <line x1="77" y1="31.8" x2="132" y2="31.8" />
        <line x1="77" y1="47.2" x2="132" y2="47.2" />
        <line x1="77" y1="62.6" x2="132" y2="62.6" />
        <line x1="77" y1="78" x2="132" y2="78" />
      </g>

      {icons[props.name]}
    </svg>
  );
}

const ICON_STYLING = css({
  fill: WHITE,
  color: CHARLES_BLUE,
  stroke: 'currentColor',
  strokeWidth: 3,

  '.frame': {
    strokeWidth: 3.5,
  },

  '.lines': {
    strokeWidth: 3.75,
  },

  '.birth': {
    stroke: 'none',
  },
});

const icons = {
  birth: (
    <g transform="translate(-80 -31) scale(1.1 1.1)" className="birth">
      <path
        fill="currentColor"
        d="M120.1 91c-.3-1.8-1-3.5-1.7-5.3-.3-.7-.6-1.4-1.1-2-.4-.5-.8-.9-1.2-1.4-4.1-4.7-5-12.8-.7-17.7 1.7-2 1.6-7.2 0-9.2-.8-1-2-1.6-3.2-2.1-4.1-1.5-8.9-1.3-12.9.6-2.5 1.2-3.7 2.7-4 5.4-1.5 13.1 5.3 41.4 17.6 41.4 3 0 5.4-2.2 6.5-4.9.8-1.6.9-3.2.7-4.8z"
      />

      <ellipse
        transform="rotate(34.386 118.151 48.032)"
        fill="#0C1F2E"
        cx="118.2"
        cy="48"
        rx="3.2"
        ry="4.4"
      />

      <ellipse
        transform="rotate(19.881 111.01 46.555)"
        fill="#0C1F2E"
        cx="111"
        cy="46.6"
        rx="2.1"
        ry="2.8"
      />

      <ellipse
        transform="rotate(8.583 105.263 46.468)"
        fill="#0C1F2E"
        cx="105.3"
        cy="46.5"
        rx="2.1"
        ry="2.8"
      />

      <ellipse
        transform="rotate(-13.639 99.556 47.887)"
        fill="#0C1F2E"
        cx="99.5"
        cy="47.9"
        rx="2.1"
        ry="2.8"
      />

      <ellipse
        transform="rotate(-22.382 94.858 51.887)"
        fill="#0C1F2E"
        cx="94.9"
        cy="51.9"
        rx="1.9"
        ry="2.6"
      />
    </g>
  ),
  id: (
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
  ),
};
