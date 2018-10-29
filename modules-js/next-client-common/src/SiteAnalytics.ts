import getConfig from 'next/config';
import { GOOGLE_TRACKING_ID_KEY } from './next-client-common';

export interface EventOptions {
  category?: string;
  label?: string;
  value?: number;
}

/**
 * Abstraction around Google Analytics implementations.
 */
export abstract class SiteAnalytics {
  static getTrackingId(): string | null {
    const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };

    return publicRuntimeConfig[GOOGLE_TRACKING_ID_KEY] || null;
  }

  /**
   * Called after the page is first rendered. Important for the GA
   * implementation, as there are impression methods that must be called before
   * "pageview" is sent.
   */
  abstract initialPageview();

  /**
   * Called when the Next router switches to a different page.
   */
  abstract changePath(path: string, timeInMs?: number);

  /**
   * Used to send custom events to Google Analytics.
   */
  abstract sendEvent(action: string, options?: EventOptions);
}
