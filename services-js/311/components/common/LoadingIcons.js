// @flow

import React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { now } from 'mobx-utils';
import { css } from 'glamor';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

const SPRITE_URL = '/static/img/svg/loading-icons.svg';


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

const ICON_ENTER_ANIMATION = {
  delay: 1000,
  duration: 400,
  animation: {
    rotateZ: [0, '60deg'],
    opacity: 1,
  },
  style: {
    display: 'none',
  },
  begin: (els) => {
    els.forEach((el) => { el.style.display = 'block'; });
  },
};

const ICON_LEAVE_ANIMATION = {
  duration: 400,
  animation: {
    rotateZ: '-60deg',
    opacity: 0,
  },
};

const DELAY = 2500;

type Props = {
  initialDelay: number,
  serverCompatible?: boolean,
}

type DefaultProps = {
  serverCompatible: boolean,
}

@observer
export default class LoadingBuildings extends React.Component {
  props: Props;
  icons: string[];

  startMillis: number;

  static defaultProps: DefaultProps = {
    serverCompatible: false,
  }

  static preload() {
    const img = new Image();
    img.src = SPRITE_URL;
  }

  componentWillMount() {
    const { initialDelay } = this.props;

    this.icons = [...ICONS];

    this.startMillis = ((+new Date()) + initialDelay) - (DELAY / 2);

    if (process.env.NODE_ENV !== 'test') {
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

  @computed get index(): number {
    return Math.max(0, Math.floor((now(50) - this.startMillis) / DELAY) % this.icons.length);
  }

  @computed get icon(): string {
    return this.icons[this.index];
  }

  render() {
    return (
      <VelocityTransitionGroup enter={ICON_ENTER_ANIMATION} leave={ICON_LEAVE_ANIMATION} className={CONTAINER_STYLE}>
        <svg role="img" key={this.icon} className={ICON_STYLE}>
          <use xlinkHref={`${SPRITE_URL}#${this.icon}`} height="100%" />
        </svg>
      </VelocityTransitionGroup>
    );
  }
}
