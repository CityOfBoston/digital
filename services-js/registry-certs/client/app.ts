/* global Stripe */

import { configure as mobxConfigure } from 'mobx';
import Router from 'next/router';
import { hydrate } from 'emotion';

import getConfig from 'next/config';

import {
  makeFetchGraphql,
  NextContext,
  FetchGraphql,
} from '@cityofboston/next-client-common';

import RouterListener from './lib/RouterListener';
import SiteAnalytics from './lib/SiteAnalytics';

import Cart from './store/Cart';
import OrderProvider from './store/OrderProvider';
import Accessibility from './store/Accessibility';

import DeathCertificatesDao from './dao/DeathCertificatesDao';
import CheckoutDao from './dao/CheckoutDao';

export type ClientContext = NextContext<Request>;

export type ClientDependencies = {
  stripe: stripe.Stripe | null;
  fetchGraphql: FetchGraphql;
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

  // Adds server generated styles to emotion cache.
  // '__NEXT_DATA__.ids' is set in '_document.js'
  if (typeof window !== 'undefined') {
    hydrate((window as any).__NEXT_DATA__.ids);
  }

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
export function getDependencies(): ClientDependencies {
  if ((process as any).browser && browserDependencies) {
    return browserDependencies;
  }

  const config = getConfig();

  const stripe =
    typeof Stripe !== 'undefined'
      ? Stripe(config.publicRuntimeConfig.stripePublishableKey)
      : null;
  const fetchGraphql = makeFetchGraphql(config);
  const deathCertificatesDao = new DeathCertificatesDao(fetchGraphql);
  const checkoutDao = new CheckoutDao(fetchGraphql, stripe);
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
    fetchGraphql,
    siteAnalytics,
  };

  if ((process as any).browser) {
    browserDependencies = dependencies;
  }

  return dependencies;
}
