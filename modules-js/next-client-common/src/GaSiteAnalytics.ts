import { SiteAnalytics, EventOptions } from './SiteAnalytics';

/**
 * SiteAnalytics implementation that uses the legacy "ga.js" implementation and
 * ga() function.
 */
export default class GaSiteAnalytics extends SiteAnalytics {
  initialPageview() {
    if (typeof ga === 'undefined') {
      return;
    }

    // This is split out separately because the e-commerce code needs to set
    // impression data before the pageview is sent.
    ga('send', 'pageview');
  }

  changePath(path: string, timeInMs?: number) {
    if (typeof ga === 'undefined') {
      return;
    }

    ga('set', 'page', path);
    ga('send', 'pageview');

    if (typeof timeInMs !== 'undefined') {
      ga('send', 'timing', 'Router', 'routeChange', timeInMs, path);
    }
  }

  sendEvent(action: string, options: EventOptions = {}) {
    if (typeof ga === 'undefined') {
      return;
    }

    ga('send', {
      hitType: 'event',
      eventCategory: options.category,
      eventAction: action,
      eventLabel: options.label,
      eventValue: options.value,
    });
  }

  addImpression(id: string, category: string, list: string, position: number) {
    if (typeof ga === 'undefined') {
      return;
    }

    ga('ec:addImpression', {
      id,
      category,
      list,
      position,
    });
  }

  addProduct(
    id: string,
    name: string,
    category: string,
    quantity?: number,
    price?: number
  ) {
    if (typeof ga === 'undefined') {
      return;
    }

    ga('ec:addProduct', {
      id,
      name,
      category,
      quantity,
      price,
    });
  }

  setProductAction(action: string, options?: Object) {
    if (typeof ga === 'undefined') {
      return;
    }

    ga('ec:setAction', action, options || {});
  }
}
