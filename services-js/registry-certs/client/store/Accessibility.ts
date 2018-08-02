import { observable, autorun } from 'mobx';

export default class Accessibility {
  el: HTMLElement | null = null;

  @observable message: string = '';
  @observable interrupt: boolean = false;

  messageListenerDisposer: Function | null = null;

  attach() {
    this.el = document.getElementById('ariaLive');

    this.messageListenerDisposer = autorun(
      () => {
        if (this.el) {
          this.el.innerText = this.message;
          this.el.setAttribute(
            'aria-live',
            this.interrupt ? 'assertive' : 'polite'
          );
        }
      },
      {
        name: 'a11y message listener',
      }
    );
  }

  detatch() {
    this.el = null;

    if (this.messageListenerDisposer) {
      this.messageListenerDisposer();
    }
  }
}
