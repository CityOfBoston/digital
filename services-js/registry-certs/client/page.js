// @flow

import React from 'react';
import type { Context } from 'next';
import { useStrict } from 'mobx';
import { rehydrate } from 'glamor';
import Router from 'next/router';

import Cart from './store/Cart';
import makeLoopbackGraphql from './loopback-graphql';
import type { LoopbackGraphql } from './loopback-graphql';

import RouterListener from './RouterListener';

// Higher-order component for a Page in our app.

// Pass this mixin a function that requires the component class and returns it.
// require is necessary rather than import since imports are hoisted to the
// beginning of files, and we need to rehydrate before any Glamor "css"
// statements are processed.

export type InitialPropsDependencies = {
  cart: Cart,
  loopbackGraphql: LoopbackGraphql,
}

let browserInited = false;
let cart: Cart;

function maybeInitBrowser() {
  if (browserInited || !process.browser) {
    return;
  }

  browserInited = true;

  // eslint-disable-next-line no-underscore-dangle
  rehydrate(window.__NEXT_DATA__.glamorIds);
  useStrict(true);

  cart = new Cart();
  const routerListener = new RouterListener();
  routerListener.attach(Router);
}

export default <OP, P: $Subtype<Object>, S> (componentFn: () => Class<React.Component<OP, P, S>>): Class<React.Component<void, P, void>> => {
  // Needs to be called before componentFn so we can initialize Glamor before the
  // static "css" constants are evaluated.
  maybeInitBrowser();

  const Component = componentFn();

  return class Page extends React.Component {
    props: P;
    loopbackGraphql: LoopbackGraphql = makeLoopbackGraphql();

    static getInitialProps(ctx: Context<*>) {
      const { req } = ctx;

      const dependencies: InitialPropsDependencies = {
        cart: cart || new Cart(),
        loopbackGraphql: makeLoopbackGraphql(req),
      };

      if (typeof Component.getInitialProps === 'function') {
        return Component.getInitialProps(ctx, dependencies);
      } else {
        return {};
      }
    }

    render() {
      const dependencies = {
        cart: cart || new Cart(),
        loopbackGraphql: this.loopbackGraphql,
      };

      return <Component {...dependencies} {...this.props} />;
    }
  };
};
