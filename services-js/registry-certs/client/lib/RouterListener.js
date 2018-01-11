// @flow

import { action } from 'mobx';
import NProgress from 'nprogress';
import type Router from 'next/router';

import type Accessibility from '../store/Accessibility';

export default class RouterListener {
  accessibility: ?Accessibility = null;
  router: ?Router = null;

  attach(router: Router, accessibility: Accessibility) {
    this.router = router;
    this.accessibility = accessibility;

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
  }

  @action.bound
  routeChangeStart() {
    NProgress.start();
  }

  @action.bound
  routeChangeComplete() {
    NProgress.done();

    const { accessibility } = this;
    if (accessibility) {
      // we do a setTimeout so that the new title renders by the time we
      // want to see it
      setTimeout(
        action(() => {
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
