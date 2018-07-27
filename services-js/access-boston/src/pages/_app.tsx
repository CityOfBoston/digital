import React from 'react';
import App, { Container } from 'next/app';
import cookies from 'next-cookies';

import { hydrate } from 'react-emotion';

import CrumbContext from '../client/CrumbContext';

export default class MyApp extends App {
  props: any;

  static async getInitialProps({ Component, ctx }) {
    // crumb is our XSRF token from the Hapi plugin
    const { crumb } = cookies(ctx);

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return { pageProps, crumb: crumb || '' };
  }

  componentWillMount() {
    // Adds server generated styles to emotion cache.
    // '__NEXT_DATA__.ids' is set in '_document.js'
    if (typeof window !== 'undefined') {
      hydrate((window as any).__NEXT_DATA__.ids);
    }
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
