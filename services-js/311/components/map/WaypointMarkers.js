// @flow

import { css } from 'glamor';

import type { DivIconOptions } from 'leaflet';

export const WAYPOINT_BASE_OPTIONS = {
  iconSize: { x: 30, y: 50 },
  iconAnchor: { x: 14, y: 50 },
};

const WAYPOINT_BASE_STYLE = {
  background: 'url(/static/img/waypoint-sprite.png) no-repeat',
  backgroundSize: '90px 100px',
};

const greenEmpty: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: css({
    ...WAYPOINT_BASE_STYLE,
    backgroundPosition: '0 0',
  }).toString(),
};

const greenFilled: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: css({
    ...WAYPOINT_BASE_STYLE,
    backgroundPosition: '0 -50px',
  }).toString(),
};

const orangeEmpty: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: css({
    ...WAYPOINT_BASE_STYLE,
    backgroundPosition: '-30px 0',
  }).toString(),
};

const orangeFilled: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: css({
    ...WAYPOINT_BASE_STYLE,
    backgroundPosition: '-30px -50px',
  }).toString(),
};

const grayFilled: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: css({
    ...WAYPOINT_BASE_STYLE,
    backgroundPosition: '-60px -50px',
  }).toString(),
};

const currentLocation: DivIconOptions = {
  ...WAYPOINT_BASE_OPTIONS,
  className: css({
    ...WAYPOINT_BASE_STYLE,
    backgroundPosition: '-60px 0',
  }).toString(),
};

export default {
  greenEmpty,
  greenFilled,
  orangeEmpty,
  orangeFilled,
  grayFilled,
  currentLocation,
};
