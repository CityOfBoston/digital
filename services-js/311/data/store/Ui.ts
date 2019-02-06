import { observable, action, computed, reaction } from 'mobx';
import throttle from 'lodash/throttle';

import { HEADER_HEIGHT } from '@cityofboston/react-fleet';

// Store to track window and scroll information.
export default class Ui {
  // This tracks the current window height, minus the fixed header height
  @observable visibleHeight: number = Number.MAX_SAFE_INTEGER;
  @observable visibleWidth: number | null = null;

  @observable scrollY: number = 0;
  @observable debouncedScrollY: number = 0;

  @observable visible: boolean = true;
  @observable reduceMotion: boolean = false;

  debouncedScrollDisposer: Function | null = null;

  @action
  attach() {
    this.debouncedScrollDisposer = reaction(
      () => this.scrollY,
      scrollY => {
        this.debouncedScrollY = scrollY;
      },
      {
        name: 'debounced scroll',
        delay: 250,
      }
    );

    if (typeof window === 'undefined') {
      return;
    }

    if (window.matchMedia) {
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion)').matches;
    }

    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);

    this.visible = !document.hidden;
    document.addEventListener('visibilitychange', this.handleVisibility);

    this.handleScroll();
    this.handleResize();
  }

  detach() {
    if (this.debouncedScrollDisposer) {
      this.debouncedScrollDisposer();
      this.debouncedScrollDisposer = null;
    }

    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);

    document.removeEventListener('visibilitychange', this.handleVisibility);
  }

  handleScroll = throttle(
    action('scroll handler', () => {
      this.scrollY =
        window.scrollY ||
        (document.documentElement && document.documentElement.scrollTop) ||
        0;
    }),
    100
  );

  handleResize = throttle(
    action('resize handler', () => {
      this.visibleHeight = window.innerHeight - HEADER_HEIGHT;
      this.visibleWidth = window.innerWidth;
    }),
    100
  );

  @action.bound
  handleVisibility() {
    this.visible = !document.hidden;
  }

  @computed
  get mediaSmall(): boolean {
    return !!this.visibleWidth && this.visibleWidth > 480;
  }
  @computed
  get mediaMedium(): boolean {
    return !!this.visibleWidth && this.visibleWidth > 768;
  }
  @computed
  get mediaLarge(): boolean {
    return !!this.visibleWidth && this.visibleWidth > 840;
  }
  @computed
  get mediaXLarge(): boolean {
    return !!this.visibleWidth && this.visibleWidth > 980;
  }
  @computed
  get mediaXXLarge(): boolean {
    return !!this.visibleWidth && this.visibleWidth > 1280;
  }

  // true if less that mediaLarge, but false if we haven't determined the screen size yet
  @computed
  get belowMediaLarge(): boolean {
    return !!this.visibleWidth && !this.mediaLarge;
  }
}
