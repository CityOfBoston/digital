import React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { now } from 'mobx-utils';
import { css } from 'emotion';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';
import inPercy from '@percy-io/in-percy';

import { assetUrl } from '../style-constants';

const SPRITE_URL = assetUrl('img/svg/loading-icons.svg');

const ICONS = [
  '311_icons_general_lighting_request',
  '311_icons_general_request',
  '311_icons_graffiti_removal',
  '311_icons_improper_storage_of_trash_barrels_',
  '311_icons_missed_trash-recycling-yard_waste-bulk_item',
  '311_icons_parking_enforcement_',
  '311_icons_pothole_repair',
  '311_icons_schedule_bulk_item_pickup',
  '311_icons_sign_repair',
  '311_icons_street_cleaning',
  '311_icons_Artboard_15',
  '311_icons_Artboard_16',
  '311_icons_Artboard_17',
  '311_icons_Artboard_18',
  '311_icons_Artboard_19',
  '311_icons_Artboard_21',
  '311_icons_schedule_bulk_item_pickup_copy',
];

const CONTAINER_STYLE = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
});

const ICON_STYLE = css({
  flex: 1,
  transformOrigin: '50% 130%',
});

const ROTATE_IN_ANIMATION = {
  delay: 1000,
  duration: 400,
  animation: {
    rotateZ: [0, '60deg'],
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

const ROTATE_OUT_ANIMATION = {
  duration: 400,
  animation: {
    rotateZ: '-60deg',
    opacity: 0,
  },
};

const FADE_IN_ANIMATION = {
  delay: 1000,
  duration: 400,
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
  duration: 400,
  animation: {
    opacity: 0,
  },
};

type Props = {
  initialDelay: number;
  serverCompatible: boolean;
  reduceMotion: boolean;
};

@observer
export default class LoadingIcons extends React.Component<Props> {
  private icons: string[] = [];
  private startMillis: number = 0;

  static defaultProps = {
    initialDelay: 0,
    serverCompatible: false,
    reduceMotion: false,
  };

  static preload() {
    const img = new Image();
    img.src = SPRITE_URL;
  }

  get delay(): number {
    const { reduceMotion } = this.props;

    return reduceMotion ? 4000 : 2500;
  }

  componentWillMount() {
    const { initialDelay, reduceMotion } = this.props;

    this.icons = [...ICONS];

    this.startMillis =
      +new Date() + (reduceMotion ? 0 : initialDelay) - this.delay / 2;

    if (process.env.NODE_ENV !== 'test' && !inPercy()) {
      this.shuffleIcons();
    }
  }

  shuffleIcons() {
    for (let i = this.icons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.icons[i];
      this.icons[i] = this.icons[j];
      this.icons[j] = temp;
    }

    // move the general request to the front
    if (this.props.serverCompatible) {
      const idx = this.icons.indexOf('311_icons_general_request');
      const tmp = this.icons[0];
      this.icons[0] = this.icons[idx];
      this.icons[idx] = tmp;
    }
  }

  @computed
  get index(): number {
    return Math.max(
      0,
      Math.floor((now(50) - this.startMillis) / this.delay) % this.icons.length
    );
  }

  @computed
  get icon(): string {
    return this.icons[this.index];
  }

  render() {
    const { reduceMotion } = this.props;

    const enter = reduceMotion ? FADE_IN_ANIMATION : ROTATE_IN_ANIMATION;
    const leave = reduceMotion ? FADE_OUT_ANIMATION : ROTATE_OUT_ANIMATION;

    return (
      <VelocityTransitionGroup
        enter={enter}
        leave={leave}
        className={CONTAINER_STYLE.toString()}
      >
        {/* Use inner HTML to avoid bad interaction between svg4everyone and React in IE */}
        <svg
          role="img"
          key={this.icon}
          className={ICON_STYLE}
          dangerouslySetInnerHTML={{
            __html: `<use xlink:href="${SPRITE_URL}#${
              this.icon
            }" height="100%"></use>`,
          }}
        />
      </VelocityTransitionGroup>
    );
  }
}
