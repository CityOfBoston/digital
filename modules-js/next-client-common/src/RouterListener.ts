import NProgress from 'nprogress';
import Router from 'next/router';
import { SiteAnalytics } from './SiteAnalytics';

// import Accessibility from '../store/Accessibility';

export function makeNProgressStyle(height: number = 65) {
  return `
#nprogress{pointer-events:none;}
#nprogress .bar{background:rgba(40,139,228,.7);position:fixed;z-index:1031;top:0;left:0;width:100%;height:${height}px;}
`;
}

export default class RouterListener {
  // accessibility: Accessibility | null = null;
  router: Router | null = null;
  siteAnalytics: SiteAnalytics | null = null;
  routeStartMs: number = 0;
  progressStartTimeout: number | null = null;

  attach(router: Router, siteAnalytics: SiteAnalytics | null) {
    this.router = router;
    // this.accessibility = accessibility;
    this.siteAnalytics = siteAnalytics;

    router.onRouteChangeStart = this.routeChangeStart;
    router.onRouteChangeComplete = this.routeChangeComplete;
    router.onRouteChangeError = this.routeChangeError;

    NProgress.configure({ showSpinner: false });

    // After setTimeout ensures that the main component's componentWillMount has
    // been called, so any impression data that needs to be sent in pageview has
    // been set.
    window.setTimeout(function() {
      if (siteAnalytics) {
        siteAnalytics.initialPageview();
      }
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

  routeChangeStart() {
    this.progressStartTimeout = window.setTimeout(() => NProgress.start(), 250);
    this.routeStartMs = Date.now();
  }

  routeChangeComplete(url: string) {
    if (this.progressStartTimeout) {
      clearTimeout(this.progressStartTimeout);
    }

    NProgress.done();

    const { siteAnalytics } = this;

    if (siteAnalytics) {
      siteAnalytics.changePath(url);
    }

    // if (accessibility) {
    //   // we do a setTimeout so that the new title renders by the time we
    //   // want to see it
    //   setTimeout(
    //     action(() => {
    //       if (ga) {
    //         ga('send', 'pageview');
    //         ga(
    //           'send',
    //           'timing',
    //           'Router',
    //           'routeChange',
    //           Date.now() - this.routeStartMs,
    //           url
    //         );
    //       }

    //       const pieces = document.title.split(/—/);
    //       accessibility.message = `Page loaded: ${pieces[
    //         pieces.length - 1
    //       ].trim()}`;
    //       accessibility.interrupt = true;
    //     }),
    //     0
    //   );
    // }
  }

  routeChangeError() {
    if (this.progressStartTimeout) {
      clearTimeout(this.progressStartTimeout);
    }

    NProgress.done();
  }
}
