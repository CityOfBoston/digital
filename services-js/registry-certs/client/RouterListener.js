// @flow

import { action } from 'mobx';
import NProgress from 'nprogress';
import type Router from 'next/router';

export default class RouterListener {
  router: ?Router = null;

  attach(router: Router) {
    this.router = router;

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

    // const { accessibility } = this.store;
    //
    // accessibility.message = 'Page loading';
    // accessibility.interrupt = true;
  }

  @action.bound
  routeChangeComplete() {
    NProgress.done();

    // const { accessibility } = this.store;
    //
    // // we do a setTimeout so that the new title renders by the time we
    // // want to see it
    // setTimeout(action(() => {
    //   accessibility.message = `${document.title} loaded`;
    //   accessibility.interrupt = true;
    // }), 0);
  }

  @action.bound
  routeChangeError() {
    NProgress.done();
  }
}
