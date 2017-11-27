// @flow
/* global Stripe */

import { useStrict } from 'mobx';
import Router from 'next/router';

import type { Context as NextContext } from 'next';

import RouterListener from './lib/RouterListener';

import makeLoopbackGraphql, {
  type LoopbackGraphql,
} from './lib/loopback-graphql';

import type { RequestAdditions } from '../server/lib/request-additions';

import Cart from './store/Cart';
import OrderProvider from './store/OrderProvider';

import DeathCertificatesDao from './dao/DeathCertificatesDao';
import CheckoutDao from './dao/CheckoutDao';

export type ClientContext = NextContext<RequestAdditions>;

export type ClientDependencies = {
  stripe: ?StripeInstance,
  loopbackGraphql: LoopbackGraphql,
  cart: Cart,
  orderProvider: OrderProvider,
  deathCertificatesDao: DeathCertificatesDao,
  checkoutDao: CheckoutDao,
};

let browserInited = false;
let browserDependencies: ClientDependencies;

// Browser-only setup
export function initBrowser() {
  if (browserInited) {
    return;
  }

  browserInited = true;

  useStrict(true);

  const routerListener = new RouterListener();
  routerListener.attach(Router);
}

// Works on both server and browser. Memoizes on browser, so these dependencies
// will share state across pages.
//
// Typically called from a wrapper function or controller component to inject
// these into a component's props.
export function getDependencies(ctx?: ClientContext): ClientDependencies {
  if (process.browser && browserDependencies) {
    return browserDependencies;
  }

  // req will exist only when this function is called for getInitialProps on the
  // server.
  const req = ctx && ctx.req;

  const stripe =
    typeof Stripe !== 'undefined'
      ? Stripe((window.__NEXT_DATA__ || {}).stripePublishableKey || '')
      : null;
  const loopbackGraphql = makeLoopbackGraphql(req);
  const deathCertificatesDao = new DeathCertificatesDao(loopbackGraphql);
  const checkoutDao = new CheckoutDao(loopbackGraphql, stripe);
  const cart = new Cart();
  const orderProvider = new OrderProvider();

  if (process.browser) {
    cart.attach(window.localStorage, deathCertificatesDao);
    orderProvider.attach(window.localStorage);
  }

  const dependencies: ClientDependencies = {
    stripe,
    cart,
    orderProvider,
    deathCertificatesDao,
    checkoutDao,
    loopbackGraphql,
  };

  if (process.browser) {
    browserDependencies = dependencies;
  }

  return dependencies;
}
