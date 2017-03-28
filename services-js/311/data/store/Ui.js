// @flow

import { observable, action } from 'mobx';
import throttle from 'lodash/throttle';

import { HEADER_HEIGHT } from '../../components/style-constants';

// Store to track window and scroll information.
export default class Ui {
  // This tracks the current window height, minus the fixed header height
  @observable visibleHeight: number = Number.MAX_SAFE_INTEGER;
  @observable scrollY: number = 0;

  attach() {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);

    this.handleScroll();
    this.handleResize();
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
  }));

  handleResize = throttle(action('resize handler', () => {
    this.visibleHeight = window.innerHeight - HEADER_HEIGHT;
  }));
}
