/* global Stripe */

import { configure as mobxConfigure } from 'mobx';
import Router from 'next/router';

import { Context as NextContext } from 'next';

import RouterListener from './lib/RouterListener';
import SiteAnalytics from './lib/SiteAnalytics';

import makeLoopbackGraphql, { LoopbackGraphql } from './lib/loopback-graphql';

import { RequestAdditions } from '../server/lib/request-additions';

import Cart from './store/Cart';
import OrderProvider from './store/OrderProvider';
import Accessibility from './store/Accessibility';

import DeathCertificatesDao from './dao/DeathCertificatesDao';
import CheckoutDao from './dao/CheckoutDao';

export type ClientContext = NextContext<RequestAdditions>;

export type ClientDependencies = {
  stripe: stripe.Stripe | null;
  loopbackGraphql: LoopbackGraphql;
  cart: Cart;
  accessibility: Accessibility;
  orderProvider: OrderProvider;
  deathCertificatesDao: DeathCertificatesDao;
  checkoutDao: CheckoutDao;
  siteAnalytics: SiteAnalytics;
};

let browserInited = false;
let browserDependencies: ClientDependencies;

const accessibility = new Accessibility();
const siteAnalytics = new SiteAnalytics();

// Browser-only setup
export function initBrowser() {
  if (browserInited) {
    return;
  }

  browserInited = true;

  mobxConfigure({ enforceActions: true });

  accessibility.attach();
  siteAnalytics.attach((window as any).ga);

  const routerListener = new RouterListener();
  routerListener.attach(Router, accessibility, (window as any).ga);
}

// Works on both server and browser. Memoizes on browser, so these dependencies
// will share state across pages.
//
// Typically called from a wrapper function or controller component to inject
// these into a component's props.
export function getDependencies(ctx?: ClientContext): ClientDependencies {
  if ((process as any).browser && browserDependencies) {
    return browserDependencies;
  }

  // req will exist only when this function is called for getInitialProps on the
  // server.
  const req = ctx && ctx.req;

  const stripe =
    typeof Stripe !== 'undefined'
      ? Stripe(
          ((window as any).__NEXT_DATA__ || {}).stripePublishableKey ||
            'test-publishable-key'
        )
      : null;
  const loopbackGraphql = makeLoopbackGraphql(req);
  const deathCertificatesDao = new DeathCertificatesDao(loopbackGraphql);
  const checkoutDao = new CheckoutDao(loopbackGraphql, stripe);
  const cart = new Cart();
  const orderProvider = new OrderProvider();

  if ((process as any).browser) {
    cart.attach(window.localStorage, deathCertificatesDao, siteAnalytics);
    orderProvider.attach(window.localStorage);
  }

  const dependencies: ClientDependencies = {
    stripe,
    accessibility,
    cart,
    orderProvider,
    deathCertificatesDao,
    checkoutDao,
    loopbackGraphql,
    siteAnalytics,
  };

  if ((process as any).browser) {
    browserDependencies = dependencies;
  }

  return dependencies;
}
