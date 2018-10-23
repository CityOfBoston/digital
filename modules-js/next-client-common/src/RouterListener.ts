import NProgress from 'nprogress';
import Router from 'next/router';
import { SiteAnalytics } from './SiteAnalytics';
import ScreenReaderSupport from './ScreenReaderSupport';

export function makeNProgressStyle(height: number = 65) {
  return `
#nprogress{pointer-events:none;}
#nprogress .bar{background:rgba(40,139,228,.7);position:fixed;z-index:1031;top:0;left:0;width:100%;height:${height}px;}
`;
}

export type Dependencies = {
  router: Router;
  siteAnalytics?: SiteAnalytics;
  screenReaderSupport?: ScreenReaderSupport;
};

export default class RouterListener {
  private router: Router | null = null;
  private siteAnalytics: SiteAnalytics | null = null;
  private screenReaderSupport: ScreenReaderSupport | null = null;

  routeStartMs: number = 0;
  progressStartTimeout: number | null = null;

  attach({ router, siteAnalytics, screenReaderSupport }: Dependencies) {
    this.router = router;
    this.siteAnalytics = siteAnalytics || null;
    this.screenReaderSupport = screenReaderSupport || null;

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

  routeChangeStart = () => {
    this.progressStartTimeout = window.setTimeout(() => NProgress.start(), 250);
    this.routeStartMs = Date.now();
  };

  routeChangeComplete = (url: string) => {
    if (this.progressStartTimeout) {
      clearTimeout(this.progressStartTimeout);
    }

    NProgress.done();

    const { siteAnalytics, screenReaderSupport } = this;

    // we do a setTimeout so that the new title renders by the time we
    // want to see it
    setTimeout(() => {
      if (siteAnalytics) {
        siteAnalytics.changePath(url, Date.now() - this.routeStartMs);
      }

      if (screenReaderSupport) {
        const pieces = document.title.split(/—/);
        screenReaderSupport.announce(
          `Page loaded: ${pieces[pieces.length - 1].trim()}`,
          true
        );
      }
    }, 0);
  };

  routeChangeError = () => {
    if (this.progressStartTimeout) {
      clearTimeout(this.progressStartTimeout);
    }

    NProgress.done();
  };
}
