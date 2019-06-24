/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { MEDIA_SMALL, WHITE } from '@cityofboston/react-fleet';

interface Props {
  name: string;
}

/**
 * Component to return a given SVG icon; because the component using
 * the SVG will include a text label, the title element is skipped and
 * the entire element is hidden from screenreaders.
 */
export default function RelatedIcon(props: Props): JSX.Element {
  const iconName = props.name;

  return <>{icons[iconName]}</>;
}

const RELATION_ITEM_STYLING = css({
  width: 100,
  fill: WHITE,
  stroke: 'currentColor',
  strokeMiterlimit: 10,
  strokeWidth: 3,

  '&.forOther': {
    width: 140,
  },

  '&.spouse': {
    ellipse: {
      fill: 'none',
      stroke: WHITE,
      strokeWidth: 8,
    },

    line: {
      strokeLinecap: 'round',
    },

    [MEDIA_SMALL]: {
      height: 90,
    },
  },

  '&.child': {
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  },

  '&.heavier': {
    strokeWidth: 3.5,
  },
});

const commonAttributes = {
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': 'true',
  focusable: 'false',
  css: RELATION_ITEM_STYLING,
};

const icons = {
  myself: (
    <svg
      {...commonAttributes}
      viewBox="-26 -4 100 100"
      className="forWhom heavier"
    >
      <path
        d="M60.832,79.224v41.865H12.04V78.748l14.238-12.2H46.684Z"
        transform="translate(-11.995 -29.65)"
      />
      <path
        d="M49.1,47.9A13.9,13.9,0,1,1,35.2,34,13.9,13.9,0,0,1,49.1,47.9Z"
        transform="translate(-10.757 -34)"
      />
    </svg>
  ),
  someoneElse: (
    <svg
      {...commonAttributes}
      viewBox="-2 -4 140 100"
      className="forOther heavier"
    >
      <path
        d="M60.832,79.224v41.865H12.04V78.748l14.238-12.2H46.684Z"
        transform="translate(-11.995 -29.65)"
      />
      <path
        d="M49.1,47.9A13.9,13.9,0,1,1,35.2,34,13.9,13.9,0,0,1,49.1,47.9Z"
        transform="translate(-10.757 -34)"
      />
      <path
        d="M112.468,61.8a13.9,13.9,0,1,1,13.9-13.9,13.9,13.9,0,0,1-13.9,13.9Z"
        transform="translate(-0.431 -34)"
      />
      <path
        d="M126.367,47.9a13.9,13.9,0,1,1-13.9-13.9,13.9,13.9,0,0,1,13.9,13.9Z"
        transform="translate(-0.431 -34)"
      />
      <path
        d="M138.1,79.224v41.865H89.31V78.748l14.238-12.2h20.405Z"
        transform="translate(-1.669 -29.65)"
      />
      <line x2="15.928" transform="translate(55.514 68.46)" strokeWidth="4" />
      <path
        d="M73.27,101.97,85.014,95.19,73.27,88.4Z"
        transform="translate(-3.812 -26.73)"
        fill="currentColor"
      />
    </svg>
  ),
  spouse: (
    <svg {...commonAttributes} viewBox="-1.5 -2 96 86" className="spouse">
      <ellipse
        cx="27.216"
        cy="27.216"
        rx="27.216"
        ry="27.216"
        transform="translate(2.704 23.465)"
      />
      <ellipse
        cx="27.216"
        cy="27.216"
        rx="27.216"
        ry="27.216"
        transform="translate(34.457 23.465)"
      />
      <path
        d="M47.471,81.511a30.308,30.308,0,1,1,6.019-4.449m-5.583-3.576a24.325,24.325,0,1,0-15.7,5.757,23.634,23.634,0,0,0,9.6-2.006"
        transform="translate(-1.5 -4.398)"
        fill="none"
      />
      <path
        d="M52.889,28.138a30.771,30.771,0,1,1-6.8,5.147m6.106,2.966a24.273,24.273,0,1,0,15.527-5.67,24.048,24.048,0,0,0-9.683,2.006"
        transform="translate(-6.045 -4.411)"
        fill="none"
      />
      <path
        d="M47.187,9.089,40.993,1.5h-12.3L22.5,9.089l7.764,12.3h9.159Z"
        transform="translate(-4.181 -1.5)"
      />
      <path
        d="M84.587,9.089,78.393,1.5h-12.3L59.9,9.089l7.764,12.3h9.159Z"
        transform="translate(-8.957 -1.5)"
      />
      <line x2="24.687" transform="translate(18.319 7.589)" />
      <line x2="24.687" transform="translate(50.943 7.589)" />
    </svg>
  ),
  child: (
    <svg {...commonAttributes} viewBox="-26 -3 89 89" className="child">
      <path
        d="M32.963,24.006a12.082,12.082,0,1,1-16.4-11.253V5.862A4.374,4.374,0,0,1,20.925,1.5a4.283,4.283,0,0,1,3.053,1.308,4.283,4.283,0,0,1,1.308,3.053v6.891A12.018,12.018,0,0,1,32.963,24.006Z"
        transform="translate(-2.432 -1.5)"
      />
      <rect width="27.565" height="8.374" transform="translate(4.623 19.976)" />
      <g transform="translate(9.247 21.197)">
        <line y2="5.408" />
        <line y2="5.408" transform="translate(6.193)" />
        <line y2="5.408" transform="translate(12.3)" />
        <line y2="5.408" transform="translate(18.406)" />
      </g>
      <g transform="translate(0 28.176)">
        <path
          d="M31.072,89.1H8.827A7.315,7.315,0,0,1,1.5,81.778V41.127A7.315,7.315,0,0,1,8.827,33.8H31.072A7.315,7.315,0,0,1,38.4,41.127v40.65A7.261,7.261,0,0,1,31.072,89.1Z"
          transform="translate(-1.5 -33.8)"
        />
        <g transform="translate(0 11.689)">
          <line x2="8.81" />
          <line x2="8.81" transform="translate(0 11.253)" />
          <line x2="8.81" transform="translate(0 22.593)" />
          <line x2="8.81" transform="translate(0 33.933)" />
        </g>
      </g>
      <path
        d="M1.5,52c4.536,0,4.536,2.879,9.072,2.879S15.108,52,19.644,52s4.536,2.879,9.072,2.879S33.165,52,37.7,52"
        transform="translate(-1.5 -8)"
      />
    </svg>
  ),
  parent: (
    <svg {...commonAttributes} viewBox="-8 -6 100 100" className="heavier">
      <path
        d="M39.755,38.7H17.344L1.5,50.687V91.965H55.494V51.208Z"
        transform="translate(-1.5 0.076)"
      />
      <ellipse
        cx="14.385"
        cy="14.385"
        rx="14.385"
        ry="14.385"
        transform="translate(12.196 0)"
      />
      <path
        d="M71.156,51.8H54.583L42.7,60.764v30.75H82.935V61.077Z"
        transform="translate(0.245 0.631)"
      />
      <ellipse
        cx="10.736"
        cy="10.736"
        rx="10.736"
        ry="10.736"
        transform="translate(52.014 23.453)"
      />
    </svg>
  ),
  familyMember: (
    <svg {...commonAttributes} viewBox="-3 -2 102 102" className="heavier">
      <path
        d="M97.428,99.889l-.206-62.853L49.31,1.9,1.5,37.036V99.889"
        transform="translate(-1.5 -1.9)"
      />
      <rect width="95.928" height="19.68" transform="translate(0 78.309)" />
      <g transform="translate(63.884 35.136)">
        <ellipse
          cx="8.243"
          cy="8.243"
          rx="8.243"
          ry="8.243"
          transform="translate(7.831)"
        />
        <path
          d="M95.545,64.9V98.179H63.5L63.6,64.9l8.861-6.7H86.581Z"
          transform="translate(-63.5 -35.326)"
        />
      </g>

      <g transform="translate(31.942 43.173)">
        <ellipse
          cx="8.243"
          cy="8.243"
          rx="8.243"
          ry="8.243"
          transform="translate(7.728 0)"
        />
        <path
          d="M64.442,72.8V97.942H32.5V72.8L41.464,66H55.58Z"
          transform="translate(-32.5 -43.126)"
        />
      </g>

      <g transform="translate(0 35.136)">
        <ellipse
          cx="8.243"
          cy="8.243"
          rx="8.243"
          ry="8.243"
          transform="translate(7.728)"
        />
        <path
          d="M33.442,64.9V98.179H1.5V64.9l8.964-6.7H24.58Z"
          transform="translate(-1.5 -35.326)"
        />
      </g>
    </svg>
  ),
  friend: (
    <svg {...commonAttributes} viewBox="-7 -7 100 100" className="heavier">
      <path
        d="M126.139,47.785A13.785,13.785,0,1,1,112.355,34a13.785,13.785,0,0,1,13.785,13.785Z"
        transform="translate(-88.158 -34)"
      />
      <path
        d="M137.7,79.12v41.522H89.31V78.648l14.122-12.1H123.67Z"
        transform="translate(-89.31 -29.952)"
      />
      <path
        d="M126.139,47.785A13.785,13.785,0,1,1,112.355,34a13.785,13.785,0,0,1,13.785,13.785Z"
        transform="translate(-49.776 -34)"
      />
      <path
        d="M137.7,79.12v41.522H89.31V78.648l14.122-12.1H123.67Z"
        transform="translate(-50.928 -29.952)"
      />
    </svg>
  ),
  client: (
    <svg {...commonAttributes} viewBox="-2 -12 93 93">
      <rect width="88.279" height="64.203" transform="translate(0 14.306)" />
      <path
        d="M3.5,17.9H89.25L82.079,43.459H10.025Z"
        transform="translate(-1.913 -3.594)"
      />
      <rect width="6.63" height="16.312" transform="translate(19.54 30.269)" />
      <rect width="6.63" height="16.312" transform="translate(60.626 30.269)" />
      <path
        d="M70.21,1.5V15.806H62.184V8.653H36.713v7.153H28.6V1.5Z"
        transform="translate(-5.309 -1.5)"
      />
    </svg>
  ),
};
