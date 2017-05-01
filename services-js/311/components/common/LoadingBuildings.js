// @flow

import React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { now } from 'mobx-utils';
import { css } from 'glamor';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

const SPRITE_URL = '/static/img/svg/loading-buildings.svg';

const NEIGHBORHOODS = [
  'allston',
  'back_bay',
  'bay_village',
  'beacon_hill',
  'brighton',
  'charlestown',
  'chinatown',
  'dorchester',
  'downtown',
  'east_boston',
  'fenway-kenmore',
  'hyde_park',
  'jamaica_plain',
  'mattapan',
  'mission_hill',
  'north_end',
  'roslindale',
  'roxbury',
  'south_boston',
  'south_end',
  'west_end',
  'west_roxbury',
];

const CONTAINER_STYLE = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
});

const BUILDING_STYLE = css({
  flex: 1,
});

const BUILDING_ENTER_ANIMATION = {
  delay: 510,
  duration: 500,
  animation: {
    translateX: [0, '30%'],
    opacity: 1,
  },
  style: {
    display: 'none',
  },
  begin: (els) => {
    els.forEach((el) => { el.style.display = 'block'; });
  },
};

const BUILDING_LEAVE_ANIMATION = {
  duration: 500,
  animation: {
    translateX: '-30%',
    opacity: 0,
  },
};

@observer
export default class LoadingBuildings extends React.Component {
  static preload() {
    const img = new Image();
    img.src = SPRITE_URL;
  }

  @computed get neighborhood(): string {
    if (process.env.NODE_ENV === 'test') {
      return 'east_boston';
    }

    now(3000);
    return NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
  }

  render() {
    return (
      <VelocityTransitionGroup enter={BUILDING_ENTER_ANIMATION} leave={BUILDING_LEAVE_ANIMATION} className={CONTAINER_STYLE} runOnMount>
        <svg role="img" key={this.neighborhood} className={BUILDING_STYLE}>
          <use xlinkHref={`${SPRITE_URL}#${this.neighborhood}`} height="100%" />
        </svg>
      </VelocityTransitionGroup>
    );
  }
}
