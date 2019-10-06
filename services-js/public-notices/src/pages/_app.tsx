import React from 'react';
import App, { Container } from 'next/app';

import { configure as mobxConfigure } from 'mobx';

import { cache as emotionCache, hydrate } from 'emotion';
import { CacheProvider } from '@emotion/core';

interface AppInitialProps {
  ctx: any;
  Component: any;
}

interface InitialProps {
  pageProps: any;
}

interface Props extends InitialProps {
  Component: any;
}

if (typeof window !== 'undefined') {
  const nextData = (window as any).__NEXT_DATA__;

  // Adds server generated styles to emotion cache.
  // '__NEXT_DATA__.ids' is set in '_document.js'
  hydrate(nextData.ids);
}

/**
 * Component to initialize Emotion and MobX.
 */
export default class PublicNoticesApp extends App {
  // TypeScript doesn't know that App already has a props member.
  protected props: Props;
  private versionInterval: number | null = null;

  static async getInitialProps({
    Component,
    ctx,
  }: AppInitialProps): Promise<InitialProps> {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return {
      pageProps,
    };
  }

  constructor(props: Props) {
    super(props);

    // We're a little hacky here because TypeScript doesn't have type
    // information about App and doesn't know it's a component and that the
    // super call above actually does this.
    this.props = props;

    if (typeof window !== 'undefined') {
      const nextData = (window as any).__NEXT_DATA__;

      // This is a long-running app. We ping every few minutes to see if a new
      // build has gone up and, if so, we do a window.reload to get it.
      this.versionInterval = window.setInterval(async () => {
        const resp = await fetch(`${nextData.assetPrefix || ''}/BUILD_ID`);
        if (resp.ok) {
          const latestId = await resp.text();
          if (nextData.buildId !== latestId) {
            window.location.reload();
          }
        }
      }, 1000 * 60 * 3);
    }

    mobxConfigure({ enforceActions: true });
  }

  componentWillUnmount() {
    if (this.versionInterval !== null) {
      window.clearInterval(this.versionInterval);
    }
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <CacheProvider value={emotionCache}>
        <Container>
          <Component {...pageProps} />
        </Container>
      </CacheProvider>
    );
  }
}
