// @flow

import { action } from 'mobx';
import NProgress from 'nprogress';
import type Router from 'next/router';

import type { AppStore } from '.';

export default class RouterListener {
  router: ?Router = null;
  store: ?AppStore = null;
  ga: any = null;
  routeStartMs: number;

  attach(router: Router, store: AppStore, ga: any) {
    this.store = store;
    this.router = router;
    this.ga = ga;

    router.onRouteChangeStart = this.routeChangeStart;
    router.onRouteChangeComplete = this.routeChangeComplete;
    router.onRouteChangeError = this.routeChangeError;

    NProgress.configure({ showSpinner: false });
  }

  detach() {
    if (this.router) {
      this.router.onRouteChangeStart = null;
      this.router.onRouteChangeComplete = null;
      this.router.onRouteChangeError = null;
    }

    this.router = null;
    this.store = null;
  }

  @action.bound
  routeChangeStart(url: string) {
    NProgress.start();

    const { store, ga } = this;

    if (store) {
      const { accessibility } = store;
      accessibility.message = 'Page loading';
      accessibility.interrupt = true;
    }

    if (ga) {
      ga('set', 'page', url);
    }

    this.routeStartMs = Date.now();
  }

  @action.bound
  routeChangeComplete(url: string) {
    NProgress.done();

    const { store, ga } = this;

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
            url,
          );
        }

        if (store) {
          const { accessibility } = store;

          accessibility.message = `${document.title} loaded`;
          accessibility.interrupt = true;
        }
      }),
      0,
    );
  }

  @action.bound
  routeChangeError() {
    NProgress.done();

    const { ga } = this;

    if (ga) {
      ga(
        'set',
        'page',
        window.location.pathname + (window.location.search || ''),
      );
    }
  }
}
