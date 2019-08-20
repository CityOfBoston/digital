/** @jsx jsx */

import { css, jsx, keyframes } from '@emotion/core';

/**
 * “Loading” spinner.
 *
 * @param {string} size
 */
export default function spinner({ size }) {
  return (
    <span css={SPINNER_STYLING} style={{ width: size }}>
      <svg
        className="spinner"
        viewBox="0 0 66 66"
        aria-hidden="true"
        focusable="false"
        height={size}
        width={size}
      >
        <circle
          className="path"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          cx="33"
          cy="33"
          r="30"
        />
      </svg>
    </span>
  );
}

const DURATION = '1.4s';
const OFFSET = '187px';

const SPIN_KEYFRAMES = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(270deg);
  }
`;

const DASH_KEYFRAMES = keyframes`
  0% {
    stroke-dashoffset: ${OFFSET};
}

  50% {
    stroke-dashoffset: calc(${OFFSET} / 4);
    transform: rotate(135deg);
}

  100% {
    stroke-dashoffset: ${OFFSET};
    transform: rotate(450deg);
  }
`;

const SPINNER_STYLING = css({
  position: 'relative',
  marginRight: '0.5em',

  '& > svg': {
    position: 'absolute',

    animation: `${SPIN_KEYFRAMES} ${DURATION} linear infinite`,
  },

  '& .path': {
    stroke: 'currentColor',
    strokeDasharray: OFFSET,
    strokeDashoffset: 0,
    transformOrigin: 'center',

    animation: `${DASH_KEYFRAMES} ${DURATION} ease-in-out infinite`,
  },
});
