// @flow

import { action } from 'mobx';
import NProgress from 'nprogress';
import type Router from 'next/router';

import type Accessibility from '../store/Accessibility';

export default class RouterListener {
  accessibility: ?Accessibility = null;
  router: ?Router = null;
  ga: any = null;
  routeStartMs: number;

  attach(router: Router, accessibility: Accessibility, ga: any) {
    this.router = router;
    this.accessibility = accessibility;
    this.ga = ga;

    router.onRouteChangeStart = this.routeChangeStart;
    router.onRouteChangeComplete = this.routeChangeComplete;
    router.onRouteChangeError = this.routeChangeError;

    NProgress.configure({ showSpinner: false });

    // After setTimeout ensures that the main component's componentWillMount has
    // been called, so any impression data that needs to be sent in pageview has
    // been set.
    window.setTimeout(function() {
      ga('send', 'pageview');
    }, 0);
  }

  detach() {
    if (this.router) {
      this.router.onRouteChangeStart = null;
      this.router.onRouteChangeComplete = null;
      this.router.onRouteChangeError = null;
    }

    this.router = null;
  }

  @action.bound
  routeChangeStart() {
    NProgress.start();

    this.routeStartMs = Date.now();
  }

  @action.bound
  routeChangeComplete(url: string) {
    NProgress.done();

    const { accessibility, ga } = this;

    if (ga) {
      ga('set', 'page', url);
    }

    if (accessibility) {
      // we do a setTimeout so that the new title renders by the time we
      // want to see it
      setTimeout(
        action(() => {
          if (ga) {
            ga('send', 'pageview');
            ga(
              'send',
              'timing',
              'Router',
              'routeChange',
              Date.now() - this.routeStartMs,
              url
            );
          }

          const pieces = document.title.split(/—/);
          accessibility.message = `Page loaded: ${pieces[
            pieces.length - 1
          ].trim()}`;
          accessibility.interrupt = true;
        }),
        0
      );
    }
  }

  @action.bound
  routeChangeError() {
    NProgress.done();
  }
}
