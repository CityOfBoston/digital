import { observable, action } from 'mobx';

export type TimerOptions = {
  callback: () => unknown;
  durationSeconds: number;
};

/**
 * Timer that counts down from its duration and then calls a callback. Loops
 * back to the beginning to count down again.
 */
export default class Timer {
  private readonly options: TimerOptions;

  @observable running: boolean = false;
  @observable secondsLeft: number = 0;

  private interval: number = 0;

  constructor(options: TimerOptions) {
    this.options = options;
  }

  @action
  start() {
    this.secondsLeft = this.options.durationSeconds;
    this.running = true;
    // This isn’t a perfect way to count down seconds but it’s close enough for
    // our purposes.
    this.interval = window.setInterval(this.handleInterval, 1000);
  }

  @action
  stop() {
    this.running = false;
    window.clearInterval(this.interval);
  }

  @action.bound
  private handleInterval() {
    this.secondsLeft--;

    if (this.secondsLeft === 0) {
      this.options.callback();
      this.secondsLeft = this.options.durationSeconds;
    }
  }
}
