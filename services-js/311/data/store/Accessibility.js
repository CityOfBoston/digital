// @flow

import { observable, autorun } from 'mobx';

export default class Accessibility {
  el: ?HTMLElement = null;

  @observable message: string = '';
  @observable interrupt: boolean = false;

  messageListenerDisposer: ?Function = null;

  attach() {
    this.el = document.getElementById('ariaLive');

    this.messageListenerDisposer = autorun('a11y message listener', () => {
      if (this.el) {
        this.el.innerText = this.message;
        this.el.setAttribute(
          'aria-live',
          this.interrupt ? 'assertive' : 'polite'
        );
      }
    });
  }

  detatch() {
    this.el = null;

    if (this.messageListenerDisposer) {
      this.messageListenerDisposer();
    }
  }
}
