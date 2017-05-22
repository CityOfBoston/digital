// @flow

import React from 'react';
import type { Context } from 'next';
import { useStrict } from 'mobx';
import { rehydrate } from 'glamor';
import Router from 'next/router';

import Cart from './store/Cart';
import makeLoopbackGraphql from './loopback-graphql';
import type { LoopbackGraphql } from './loopback-graphql';
import type { RequestAdditions } from '../server/request-additions';

import DeathCertificatesDao from './dao/DeathCertificatesDao';
import RouterListener from './RouterListener';

// Higher-order component for a Page in our app.

// Pass this mixin a function that requires the component class and returns it.
// require is necessary rather than import since imports are hoisted to the
// beginning of files, and we need to rehydrate before any Glamor "css"
// statements are processed.

export type ClientDependencies = {
  cart: Cart,
  deathCertificatesDao: DeathCertificatesDao,
  loopbackGraphql: LoopbackGraphql,
}

let browserInited = false;
let browserDependencies: ClientDependencies;

function maybeInitBrowserLibraries() {
  if (browserInited || !process.browser) {
    return;
  }

  browserInited = true;

  // eslint-disable-next-line no-underscore-dangle
  rehydrate(window.__NEXT_DATA__.glamorIds);
  useStrict(true);

  const routerListener = new RouterListener();
  routerListener.attach(Router);
}

function makeDependencies(req: ?RequestAdditions): ClientDependencies {
  if (process.browser && browserDependencies) {
    return browserDependencies;
  }

  const loopbackGraphql = makeLoopbackGraphql(req);
  const deathCertificatesDao = new DeathCertificatesDao(loopbackGraphql);

  const cart = new Cart();
  if (process.browser) {
    cart.attach(window.localStorage, deathCertificatesDao);
  }

  const dependencies: ClientDependencies = {
    cart,
    deathCertificatesDao,
    loopbackGraphql,
  };

  if (process.browser) {
    browserDependencies = dependencies;
  }

  return dependencies;
}

export default <OP, P: $Subtype<Object>, S> (componentFn: () => Class<React.Component<OP, P, S>>): Class<React.Component<void, P, void>> => {
  // Needs to be called before componentFn so we can initialize Glamor before the
  // static "css" constants are evaluated.
  maybeInitBrowserLibraries();

  const Component = componentFn();

  return class Page extends React.Component {
    props: P;
    loopbackGraphql: LoopbackGraphql = makeLoopbackGraphql();

    static getInitialProps(ctx: Context<*>) {
      const { req } = ctx;

      const dependencies = makeDependencies(req);

      if (typeof Component.getInitialProps === 'function') {
        return Component.getInitialProps(ctx, dependencies);
      } else {
        return {};
      }
    }

    render() {
      const dependencies = makeDependencies();
      return <Component {...dependencies} {...this.props} />;
    }
  };
};
