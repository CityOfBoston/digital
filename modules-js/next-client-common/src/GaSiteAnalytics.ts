import { SiteAnalytics, EventOptions } from './SiteAnalytics';

/**
 * SiteAnalytics implementation that uses the legacy "ga.js" implementation and
 * ga() function.
 */
export default class GaSiteAnalytics extends SiteAnalytics {
  initialPageview() {
    // This is split out separately because the e-commerce code needs to set
    // impression data before the pageview is sent.
    ga('send', 'pageview');
  }

  changePath(path: string) {
    ga('set', 'page', path);
  }

  sendEvent(action: string, options: EventOptions = {}) {
    ga('send', {
      hitType: 'event',
      eventCategory: options.category,
      eventAction: action,
      eventLabel: options.label,
      eventValue: options.value,
    });
  }
}
