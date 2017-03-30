// @flow

// eslint-disable-next-line
import type { Icon } from 'google-maps';

const SPRITE_URL = '/static/img/waypoints.png';
// All of these are in pixels after scaling down 2x
const WAYPOINT_WIDTH = 40;
const WAYPOINT_HEIGHT = 51;

// We cheat in the Size / Points rather than construct them from the Google Maps
// classes so that this code doesn’t have to depend on the Google Maps API loading.
function makeIcon(pos: number): Icon {
  return {
    url: SPRITE_URL,
    origin: ({ x: pos * WAYPOINT_WIDTH, y: 0 }: any),
    size: ({ width: WAYPOINT_WIDTH, height: WAYPOINT_HEIGHT }: any),
    scaledSize: ({ width: (WAYPOINT_WIDTH * 5), height: WAYPOINT_HEIGHT }: any),
  };
}

export function preloadWaypointSprite() {
  const img = new Image();
  img.src = SPRITE_URL;
}

export const openSelectedWaypointIcon = makeIcon(0);
export const openWaypointIcon = makeIcon(1);
export const closedSelectedWaypointIcon = makeIcon(2);
export const closedWaypointIcon = makeIcon(3);
export const disabledWaypointIcon = makeIcon(4);
