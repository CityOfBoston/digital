/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { CHARLES_BLUE, GREEN, WHITE } from '@cityofboston/react-fleet';

type IconName = 'checkMark' | 'questionMark' | 'xSymbol' | 'excl';

interface Props {
  iconName: IconName;
}

/**
 * Utility component; produces an element to be used as an icon that is a
 * check mark, question mark, or X.
 */
export default function AnswerIcon(props: Props): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2.5 -2.5 66 66"
      aria-hidden="true"
      focusable="false"
      className={props.iconName}
      css={ANSWER_ICON_STYLING}
    >
      <ellipse cx="30.377" cy="30.377" rx="30.377" ry="30.377" />

      {iconElements[props.iconName]}
    </svg>
  );
}

const iconElements = {
  checkMark: (
    <path
      d="M50.937,26.2,30.069,47.068,21,38.791"
      transform="translate(-5.591 -6.213)"
    />
  ),
  xSymbol: (
    <g transform="translate(19.107 19.107)">
      <line x2="22.629" y2="22.629" />
      <line y1="22.629" x2="22.629" />
    </g>
  ),
  questionMark: (
    <g transform="translate(20.339 12.679)">
      <path
        d="M40.16,41.233H33.116V37.8a5.929,5.929,0,0,1,.528-2.818,12.363,12.363,0,0,1,2.025-2.553l3.17-3.258a3.213,3.213,0,0,0,.7-2.113,3.651,3.651,0,0,0-.7-2.2,2.377,2.377,0,0,0-1.937-.88,2.467,2.467,0,0,0-2.025,1.057,5.057,5.057,0,0,0-.969,2.73H26.6a11.361,11.361,0,0,1,3.346-7.22A10.214,10.214,0,0,1,37.078,17.9a9.953,9.953,0,0,1,6.956,2.377,8.3,8.3,0,0,1,2.73,6.516,7,7,0,0,1-.44,2.73c-.264.616-.528,1.057-.616,1.321a5.625,5.625,0,0,1-.88,1.145,5.222,5.222,0,0,1-.88.969L41.832,35.07a6.192,6.192,0,0,0-1.321,1.585A4.913,4.913,0,0,0,40.16,38.5Z"
        transform="translate(-26.6 -17.9)"
      />
      <path
        d="M34.745,55.856A4.26,4.26,0,1,1,37.65,57,3.606,3.606,0,0,1,34.745,55.856Z"
        transform="translate(-27.437 -21.605)"
      />
    </g>
  ),
  excl: (
    <path
      d="M97.42,102.13a2.8,2.8,0,0,1,5.58,0,2.79,2.79,0,0,1-5.58,0Zm.09-17.93h5.41L102,97.48h-3.6Z"
      fill="currentColor"
      transform="translate(-110 -101) scale(1.4)"
    />
  ),
};

const ANSWER_ICON_STYLING = css({
  width: 80,
  height: 80,

  ellipse: {
    stroke: 'currentColor',
    strokeWidth: 5,
    fill: WHITE,
  },

  '&.checkMark, &.xSymbol': {
    fill: 'none',
    strokeWidth: 7,
    strokeLinecap: 'round',
  },

  '&.checkMark': {
    stroke: GREEN,
  },

  '&.xSymbol': {
    stroke: '#f04f46',
  },

  '&.questionMark': {
    path: {
      fill: CHARLES_BLUE,
      stroke: 'none',
    },
  },
});
