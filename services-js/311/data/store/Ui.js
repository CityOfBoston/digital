// @flow

import { observable, action, computed } from 'mobx';
import throttle from 'lodash/throttle';

import { HEADER_HEIGHT } from '../../components/style-constants';

// Store to track window and scroll information.
export default class Ui {
  // This tracks the current window height, minus the fixed header height
  @observable visibleHeight: number = Number.MAX_SAFE_INTEGER;
  @observable scrollY: number = 0;
  @observable visibleWidth: ?number;

  attach() {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);

    this.handleScroll();
    // Do this after the first render so we match the server content
    setTimeout(this.handleResize, 0);
  }

  detach() {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }

  handleScroll = throttle(action('scroll handler', () => {
    this.scrollY = window.scrollY || (document.documentElement && document.documentElement.scrollTop) || 0;
  }), 100);

  handleResize = throttle(action('resize handler', () => {
    this.visibleHeight = window.innerHeight - HEADER_HEIGHT;
    this.visibleWidth = window.innerWidth;
  }), 100);

  @computed get mediaSmall(): boolean { return !!this.visibleWidth && this.visibleWidth > 480; }
  @computed get mediaMedium(): boolean { return !!this.visibleWidth && this.visibleWidth > 768; }
  @computed get mediaLarge(): boolean { return !!this.visibleWidth && this.visibleWidth > 840; }
  @computed get mediaXLarge(): boolean { return !!this.visibleWidth && this.visibleWidth > 980; }
  @computed get mediaXXLarge(): boolean { return !!this.visibleWidth && this.visibleWidth > 1280; }

  // true if less that mediaLarge, but false if we haven't determined the screen size yet
  @computed get belowMediaLarge(): boolean { return !!this.visibleWidth && !this.mediaLarge; }
}
