import { css } from 'emotion';

import { DivIconOptions } from 'mapbox.js';
import { assetUrl } from '../style-constants';

const SPRITE_URL = assetUrl('img/svg/waypoints.svg');

export const WAYPOINT_BASE_OPTIONS: Partial<DivIconOptions> = {
  iconSize: [30, 50],
  iconAnchor: [14, 50],
};

const SPRITE_STYLE = css({
  width: '100%',
  height: '100%',
});

export const WAYPOINT_STYLE = css({
  position: 'absolute',
  width: WAYPOINT_BASE_OPTIONS.iconSize![0],
  height: WAYPOINT_BASE_OPTIONS.iconSize![1],
  top: '50%',
  left: '50%',
  transform: `translate(${-WAYPOINT_BASE_OPTIONS.iconAnchor![0]}px, ${-WAYPOINT_BASE_OPTIONS.iconAnchor![1]}px)`,
});

export const WAYPOINT_NUMBER_STYLE = css({
  position: 'absolute',
  width: '100%',
  textAlign: 'center',
  top: 7,
  fontSize: 16,
});

const greenEmpty: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: '',
  html: `
    <svg role="img" class="${SPRITE_STYLE.toString()}">
      <use xlink:href="${SPRITE_URL}#green-empty" height="100%" />
    </svg>
  `,
};

const greenFilled: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: '',
  html: `
    <svg role="img" class="${SPRITE_STYLE.toString()}">
      <use xlink:href="${SPRITE_URL}#green-filled" height="100%" />
    </svg>
  `,
};

const orangeEmpty: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: '',
  html: `
    <svg role="img" class="${SPRITE_STYLE.toString()}">
      <use xlink:href="${SPRITE_URL}#orange-empty" height="100%" />
    </svg>
  `,
};

const orangeFilled: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: '',
  html: `
    <svg role="img" class="${SPRITE_STYLE.toString()}">
      <use xlink:href="${SPRITE_URL}#orange-filled" height="100%" />
    </svg>
  `,
};

const grayFilled: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: '',
  html: `
    <svg role="img" class="${SPRITE_STYLE.toString()}">
      <use xlink:href="${SPRITE_URL}#gray-filled" height="100%" />
    </svg>
  `,
};

const currentLocation: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: '',
  html: `
    <svg role="img" class="${SPRITE_STYLE.toString()}">
      <use xlink:href="${SPRITE_URL}#current-location" height="100%" />
    </svg>
  `,
};

export function preloadWaypointSprite() {
  const img = new Image();
  img.src = SPRITE_URL;
}

export default {
  greenEmpty,
  greenFilled,
  orangeEmpty,
  orangeFilled,
  grayFilled,
  currentLocation,
};
