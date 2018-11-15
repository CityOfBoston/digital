import React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { now } from 'mobx-utils';
import { css } from 'emotion';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';
import inPercy from '@percy-io/in-percy';

import { assetUrl } from '../style-constants';

const SPRITE_URL = assetUrl('img/svg/loading-buildings.svg');

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

const SLIDE_IN_ANIMATION = {
  delay: 510,
  duration: 500,
  animation: {
    translateX: [0, '30%'],
    opacity: 1,
  },
  style: {
    display: 'none',
  },
  begin: els => {
    els.forEach(el => {
      el.style.display = 'block';
    });
  },
};

const SLIDE_OUT_ANIMATION = {
  duration: 500,
  animation: {
    translateX: '-30%',
    opacity: 0,
  },
};

const FADE_IN_ANIMATION = {
  delay: 510,
  duration: 500,
  animation: {
    opacity: 1,
  },
  style: {
    display: 'none',
  },
  begin: els => {
    els.forEach(el => {
      el.style.display = 'block';
    });
  },
};

const FADE_OUT_ANIMATION = {
  duration: 500,
  animation: {
    opacity: 0,
  },
};

type Props = {
  reduceMotion: boolean;
};

@observer
export default class LoadingBuildings extends React.Component<Props> {
  static defaultProps = {
    reduceMotion: false,
  };

  static preload() {
    const img = new Image();
    img.src = SPRITE_URL;
  }

  @computed
  get neighborhood(): string {
    const { reduceMotion } = this.props;

    if (process.env.NODE_ENV === 'test' || inPercy()) {
      return NEIGHBORHOODS[0];
    }

    now(reduceMotion ? 4000 : 2500);

    return NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
  }

  render() {
    const { reduceMotion } = this.props;
    const enter = reduceMotion ? FADE_IN_ANIMATION : SLIDE_IN_ANIMATION;
    const leave = reduceMotion ? FADE_OUT_ANIMATION : SLIDE_OUT_ANIMATION;

    return (
      <VelocityTransitionGroup
        enter={enter}
        leave={leave}
        className={CONTAINER_STYLE}
        runOnMount
      >
        {/* Use inner HTML to avoid bad interaction between svg4everyone and React in IE */}
        <svg
          role="img"
          key={this.neighborhood}
          className={BUILDING_STYLE}
          dangerouslySetInnerHTML={{
            __html: `<use xlink:href="${SPRITE_URL}#${
              this.neighborhood
            }" height="100%"></use>`,
          }}
        />
      </VelocityTransitionGroup>
    );
  }
}
