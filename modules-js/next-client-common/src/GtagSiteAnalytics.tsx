import React from 'react';
import { SiteAnalytics, EventOptions } from './SiteAnalytics';

/**
 * SiteAnalytics implementation for the new Google Tag Manager JavaScript.
 */
export default class GtagSiteAnalytics extends SiteAnalytics {
  private googleTrackingId: string;

  constructor(googleTrackingId: string | null = SiteAnalytics.getTrackingId()) {
    super();

    this.googleTrackingId = googleTrackingId || '';
  }

  static makeTrackingCode(
    googleTrackingId: string | null = SiteAnalytics.getTrackingId()
  ): React.ReactNode {
    if (!googleTrackingId) {
      return null;
    }

    return (
      <>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${googleTrackingId}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleTrackingId}');
            `,
          }}
        />
      </>
    );
  }

  initialPageview() {
    // nothing to do, since the 'config' in the initial snippet handles this.
  }

  changePath(path: string, timeInMs?: number) {
    if (typeof gtag === 'undefined') {
      return;
    }

    gtag('config', this.googleTrackingId, { page_path: path });

    if (typeof timeInMs !== 'undefined') {
      gtag('event', 'timing_complete', {
        name: 'routeChange',
        value: timeInMs,
        event_category: 'Router',
        event_label: path,
      });
    }
  }

  sendEvent(action: string, options: EventOptions = {}) {
    if (typeof gtag === 'undefined') {
      return;
    }

    gtag('event', action, {
      event_category: options.category,
      event_label: options.label,
      value: options.value,
    });
  }
}
