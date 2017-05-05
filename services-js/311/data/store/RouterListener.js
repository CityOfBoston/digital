// @flow

import { action } from 'mobx';

import type Router from 'next/router';
import type { AppStore } from '.';

export default class RouterListener {
  router: ?Router = null;
  store: ?AppStore = null;

  attach(router: Router, store: AppStore) {
    this.store = store;
    this.router = router;

    router.onRouteChangeStart = this.routeChangeStart;
    router.onRouteChangeComplete = this.routeChangeComplete;
    router.onRouteChangeError = this.routeChangeError;
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
  routeChangeStart() {
    if (!this.store) {
      return;
    }

    const { accessibility } = this.store;

    accessibility.message = 'Page loading';
    accessibility.interrupt = true;
  }

  @action.bound
  routeChangeComplete() {
    if (!this.store) {
      return;
    }

    const { accessibility } = this.store;

    // we do a setTimeout so that the new title renders by the time we
    // want to see it
    setTimeout(action(() => {
      accessibility.message = `${document.title} loaded`;
      accessibility.interrupt = true;
    }), 0);
  }

  @action.bound
  routeChangeError() {

  }
}
