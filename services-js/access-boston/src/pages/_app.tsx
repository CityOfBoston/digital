import React from 'react';
import App, { Container } from 'next/app';
import Router from 'next/router';
import getConfig from 'next/config';
import cookies from 'next-cookies';

import { hydrate } from 'react-emotion';

import CrumbContext from '../client/CrumbContext';
import RouterListener from '@cityofboston/next-client-common/build/RouterListener';
import {
  FetchGraphql,
  makeFetchGraphql,
} from '@cityofboston/next-client-common';

export interface AppDependencies {
  fetchGraphql: FetchGraphql;
  routerListener: RouterListener;
}

interface InitialProps {
  pageProps: any;
  crumb: string;
  appDependencies: AppDependencies;
}

interface Props extends InitialProps {
  Component: any;
}

/**
 * Custom app wrapper. Sets up global dependencies and passes them in as a
 * second argument to getInitialProps for our pages.
 */
export default class AccessBostonApp extends App {
  props: Props;

  static async getInitialProps({ Component, ctx }): Promise<InitialProps> {
    const appDependencies: AppDependencies = {
      fetchGraphql: makeFetchGraphql(getConfig(), ctx.req),
      routerListener: new RouterListener(),
    };

    // crumb is our XSRF token from the Hapi plugin
    const { crumb } = cookies(ctx);

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx, appDependencies)
      : {};

    return { pageProps, appDependencies, crumb: crumb || '' };
  }

  constructor(props: Props) {
    super(props);

    // We're a little hacky here because TypeScript doesn't have type
    // information about App and doesn't know it's a component.
    this.props = props;

    // Adds server generated styles to emotion cache.
    // '__NEXT_DATA__.ids' is set in '_document.js'
    if (typeof window !== 'undefined') {
      hydrate((window as any).__NEXT_DATA__.ids);
    }
  }

  componentDidMount() {
    const { routerListener } = this.props.appDependencies;
    routerListener.attach(Router, (window as any).ga);
  }

  componentWillUnmount() {
    const { routerListener } = this.props.appDependencies;
    routerListener.detach();
  }

  render() {
    const { Component, pageProps, crumb } = this.props;

    return (
      <CrumbContext.Provider value={crumb}>
        <Container>
          <Component {...pageProps} />
        </Container>
      </CrumbContext.Provider>
    );
  }
}
