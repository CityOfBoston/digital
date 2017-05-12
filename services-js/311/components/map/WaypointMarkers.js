// @flow

import { css } from 'glamor';

import type { DivIconOptions } from 'leaflet';

const SPRITE_URL = '/static/img/svg/waypoints.svg';

export const WAYPOINT_BASE_OPTIONS = {
  iconSize: { x: 30, y: 50 },
  iconAnchor: { x: 14, y: 50 },
};

const SPRITE_STYLE = css({
  width: '100%',
  height: '100%',
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
