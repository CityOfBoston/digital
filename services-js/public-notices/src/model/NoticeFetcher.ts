import getConfig from 'next/config';
import Notice from './Notice';

export type NoticeFetcherOptions = {
  intervalMs: number;
  url: string;
  numNotices: number;
  callback: (notices: Notice[]) => unknown;
};

const config = getConfig();

const DEFAULT_OPTIONS: NoticeFetcherOptions = {
  intervalMs: 1000 * 60 * 5,
  url: config.publicRuntimeConfig.noticesApiUrl,
  numNotices: 12,
  callback: () => {},
};

/**
 * Fetches the notices in a loop. Handles exponential falloff in the case of bad
 * responses.
 */
export default class NoticeFetcher {
  private readonly options: NoticeFetcherOptions;
  private nextFetchTimeout: number | null = null;
  private failureCount: number = 0;

  constructor(opts: Partial<NoticeFetcherOptions> = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, opts);
  }

  start() {
    this.runFetch();
  }

  stop() {
    if (this.nextFetchTimeout !== null) {
      window.clearTimeout(this.nextFetchTimeout);
    }
  }

  /**
   * Fetches the notices, then schedules the next request.
   *
   * If the fetch was successful, loads the next one in intervalMs time.
   * Otherwise schedules a retry with an exponential backoff.
   */
  private async runFetch() {
    try {
      const resp = await fetch(`${this.options.url}?${Date.now()}`);

      if (resp.ok) {
        this.options.callback(
          (await resp.json()).slice(0, this.options.numNotices)
        );
        this.failureCount = 0;
      } else {
        throw new Error(`Unexpected HTTP response: ${resp.status}`);
      }
    } catch (e) {
      this.failureCount++;
      window.Rollbar && window.Rollbar.error(e);
    }

    const nextFetchTime =
      this.failureCount === 0
        ? this.options.intervalMs
        : // Math.min so that our exponential backoff never exceeds the scheduled
          // time between requests.
          Math.min(
            1000 * Math.pow(2, this.failureCount),
            this.options.intervalMs
          );

    this.nextFetchTimeout = window.setTimeout(
      () => this.runFetch(),
      nextFetchTime
    );
  }
}
