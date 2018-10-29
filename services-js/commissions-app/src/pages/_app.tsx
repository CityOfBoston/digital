import React from 'react';
import App, { Container } from 'next/app';
import Router from 'next/router';
import { hydrate } from 'emotion';
import { SiteAnalytics } from '@cityofboston/next-client-common/build/SiteAnalytics';
import {
  RouterListener,
  GtagSiteAnalytics,
  ScreenReaderSupport,
} from '@cityofboston/next-client-common';

interface Props {
  pageProps: any;
  Component: any;
}

export default class CommissionsApp extends App {
  // TypeScript doesn't know that App already has a props member.
  protected props: Props;

  private routerListener: RouterListener;
  private siteAnalytics: SiteAnalytics;
  private screenReaderSupport: ScreenReaderSupport;

  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return { pageProps };
  }

  constructor(props: Props) {
    super(props);

    // We're a little hacky here because TypeScript doesn't have type
    // information about App and doesn't know it's a component and that the
    // super call above actually does this.
    this.props = props;

    // Adds server generated styles to emotion cache.
    // '__NEXT_DATA__.ids' is set in '_document.js'
    if (typeof window !== 'undefined') {
      hydrate((window as any).__NEXT_DATA__.ids);
    }

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
      <Container>
        <Component {...pageProps} />
      </Container>
    );
  }
}
