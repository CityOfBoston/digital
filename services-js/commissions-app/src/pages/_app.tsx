import React from 'react';
import App, { AppProps } from 'next/app';
import Router from 'next/router';
import { hydrate, cache as emotionCache } from 'emotion';
import { CacheProvider } from '@emotion/core';
import { SiteAnalytics } from '@cityofboston/next-client-common/build/SiteAnalytics';
import {
  RouterListener,
  GtagSiteAnalytics,
  ScreenReaderSupport,
} from '@cityofboston/next-client-common';

// Adds server generated styles to emotion cache.
// '__NEXT_DATA__.ids' is set in '_document.js'
if (typeof window !== 'undefined') {
  hydrate((window as any).__NEXT_DATA__.ids);
}

export default class CommissionsApp extends App {
  private routerListener: RouterListener;
  private siteAnalytics: SiteAnalytics;
  private screenReaderSupport: ScreenReaderSupport;

  constructor(props: AppProps) {
    super(props);

    this.routerListener = new RouterListener();
    this.siteAnalytics = new GtagSiteAnalytics();
    this.screenReaderSupport = new ScreenReaderSupport();
  }

  componentDidMount() {
    this.screenReaderSupport.attach();
    this.routerListener.attach({
      router: Router,
      siteAnalytics: this.siteAnalytics,
      screenReaderSupport: this.screenReaderSupport,
    });
  }

  componentWillUnmount() {
    this.routerListener.detach();
    this.screenReaderSupport.detach();
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <CacheProvider value={emotionCache}>
        <Component {...pageProps} />
      </CacheProvider>
    );
  }
}
