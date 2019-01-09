import React from 'react';
import App, { Container } from 'next/app';

import { configure as mobxConfigure } from 'mobx';
import { hydrate } from 'emotion';

import { NextContext } from '@cityofboston/next-client-common';

interface AppInitialProps {
  ctx: NextContext<unknown>;
  Component: any;
}

interface InitialProps {
  pageProps: any;
}

interface Props extends InitialProps {
  Component: any;
}

/**
 * Component to initialize Emotion and MobX.
 */
export default class PublicNoticesApp extends App {
  // TypeScript doesn't know that App already has a props member.
  protected props: Props;

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

    // Adds server generated styles to emotion cache.
    // '__NEXT_DATA__.ids' is set in '_document.js'
    if (typeof window !== 'undefined') {
      hydrate((window as any).__NEXT_DATA__.ids);
    }

    mobxConfigure({ enforceActions: true });
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
