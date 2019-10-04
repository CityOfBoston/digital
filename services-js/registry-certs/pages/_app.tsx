import React from 'react';
import { IncomingMessage } from 'http';

import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import Router from 'next/router';
import getConfig from 'next/config';
import { NextPageContext } from 'next';

import { configure as mobxConfigure } from 'mobx';

import {
  makeFetchGraphql,
  ScreenReaderSupport,
  RouterListener,
  GaSiteAnalytics,
} from '@cityofboston/next-client-common';

import BirthCertificateRequest from '../client/store/BirthCertificateRequest';
import MarriageCertificateRequest from '../client/store/MarriageCertificateRequest';
import DeathCertificateCart from '../client/store/DeathCertificateCart';

import OrderProvider from '../client/store/OrderProvider';
import DeathCertificatesDao from '../client/dao/DeathCertificatesDao';
import CheckoutDao from '../client/dao/CheckoutDao';

/**
 * Our App’s getInitialProps automatically calls the page’s getInitialProps with
 * an instance of this class as the second argument, after the Next context.
 */
export interface GetInitialPropsDependencies {
  deathCertificatesDao: DeathCertificatesDao;
}

/**
 * Generic type for a page’s GetInitialProps. Has built-in "Pick" types so that
 * a function can declare the minimum fields of NextContext and
 * GetInitialPropsDependencies that it cares about. That way tests only need to
 * supply relevant values.
 */
export type GetInitialProps<
  T,
  C extends keyof NextPageContext = never,
  D extends keyof GetInitialPropsDependencies = never
> = (
  cxt: Pick<NextPageContext, C>,
  deps: Pick<GetInitialPropsDependencies, D>
) => T | Promise<T>;

/**
 * These props are automatically given to any Pages in the app. While magically
 * providing Props out of nowhere is a bit hard to follow, this pattern seems to
 * have the best combination of allowing Pages to be explicit about their
 * dependencies for testing purposes while avoiding too much boilerplate of
 * wrapper components and Context.Consumer render props.
 *
 * To use this:
 *
 * interface InitialProps {
 *   foo: string;
 *   bar: string[];
 * }
 *
 * interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'>
 * {}
 *
 * class MyPage extends React.Component<Props> {
 *   static getInitialProps:
 *     GetInitialProps<InitialProps, 'query', 'dao'> = async ({query}, {dao}) => {
 *     ...
 *   }
 *
 *   handleAction: () => {
 *     this.props.fetchGraphql(…);
 *   }
 * }
 */
export interface PageDependencies extends GetInitialPropsDependencies {
  stripe: stripe.Stripe | null;
  checkoutDao: CheckoutDao;
  birthCertificateRequest: BirthCertificateRequest;
  marriageCertificateRequest: MarriageCertificateRequest;
  deathCertificateCart: DeathCertificateCart;
  screenReaderSupport: ScreenReaderSupport;
  routerListener: RouterListener;
  orderProvider: OrderProvider;
  siteAnalytics: GaSiteAnalytics;
}

// It’s important to cache the dependencies passed to getInitialProps because
// they won’t be automatically re-used the way that the dependencies passed as
// props are.
//
// This is key so that Daos passed to getInitialProps maintain their caches
// across pages.
let cachedInitialPageDependencies: GetInitialPropsDependencies;

/**
 * Returns a possibly-cached version of GetInitialPropsDependencies, the
 * dependency type that we give to getInitialProps.
 */
function getInitialPageDependencies(
  req?: IncomingMessage
): GetInitialPropsDependencies {
  if (cachedInitialPageDependencies) {
    return cachedInitialPageDependencies;
  }

  const config = getConfig();
  const fetchGraphql = makeFetchGraphql(config, req);
  const deathCertificatesDao = new DeathCertificatesDao(fetchGraphql);

  const initialPageDependencies: GetInitialPropsDependencies = {
    deathCertificatesDao,
  };

  if ((process as any).browser) {
    cachedInitialPageDependencies = initialPageDependencies;
  }

  return initialPageDependencies;
}

/**
 * Custom app wrapper for setting up global dependencies:
 *
 *  - GetInitialPropsDependencies are passed as a second argument to getInitialProps
 *  - PageDependencies are spread as props for the page
 */
export default class RegistryCertsApp extends App {
  private pageDependencies: PageDependencies;

  static async getInitialProps({
    Component,
    ctx,
  }: AppContext): Promise<AppInitialProps> {
    const pageProps = Component.getInitialProps
      ? await (Component.getInitialProps as GetInitialProps<
          any,
          keyof NextPageContext,
          keyof GetInitialPropsDependencies
        >)(ctx, getInitialPageDependencies(ctx.req))
      : {};

    return {
      pageProps,
    };
  }

  constructor(props: AppProps) {
    super(props);

    mobxConfigure({ enforceActions: true });

    const initialPageDependencies = getInitialPageDependencies();

    const birthCertificateRequest = new BirthCertificateRequest();
    const marriageCertificateRequest = new MarriageCertificateRequest();
    const deathCertificateCart = new DeathCertificateCart();
    const orderProvider = new OrderProvider();
    const siteAnalytics = new GaSiteAnalytics();

    const config = getConfig();

    const stripe =
      typeof Stripe !== 'undefined'
        ? Stripe(config.publicRuntimeConfig.stripePublishableKey)
        : null;

    const fetchGraphql = makeFetchGraphql(config);

    birthCertificateRequest.setSiteAnalytics(siteAnalytics);

    this.pageDependencies = {
      ...initialPageDependencies,
      stripe,
      checkoutDao: new CheckoutDao(fetchGraphql, stripe),
      routerListener: new RouterListener(),
      screenReaderSupport: new ScreenReaderSupport(),
      siteAnalytics,
      birthCertificateRequest,
      marriageCertificateRequest,
      deathCertificateCart,
      orderProvider,
    };
  }

  componentDidMount() {
    const {
      routerListener,
      screenReaderSupport,
      siteAnalytics,
      deathCertificateCart,
      orderProvider,
      deathCertificatesDao,
      birthCertificateRequest,
      marriageCertificateRequest,
    } = this.pageDependencies;

    screenReaderSupport.attach();
    routerListener.attach({
      router: Router,
      siteAnalytics,
      screenReaderSupport,
    });

    // We do Storage attachment on componentDidMount to ensure that the initial
    // render matches the server, which does not have Storage available. The
    // small flash from no data -> data is typically not a problem.

    // We need to ensure localStorage is available in the browser,
    // otherwise an error could be thrown:
    // https://github.com/CityOfBoston/digital/issues/199
    let localStorage: Storage | null = null;
    let sessionStorage: Storage | null = null;

    try {
      localStorage = window.localStorage;
      sessionStorage = window.sessionStorage;
    } catch {
      //  possible security error; ignore.
    }

    if (sessionStorage) {
      // QuestionsPage is set up to clone its birthCertificateRequest/
      // marriageCertificateRequest object so that it can manipulate it
      // and only save the value back when the user presses the "Next" button.
      //
      // Because that cloning happens on initial load, any changes to the
      // birthCertificateRequest/marriageCertificateRequest here in
      // componentDidMount would not be picked up. That’s why we clone and
      // create a brand new object, which QuestionsPage can detect and update
      // itself with.
      const newBirthCertificateRequest = birthCertificateRequest.clone();
      const newMarriageCertificateRequest = marriageCertificateRequest.clone();

      newBirthCertificateRequest.attach(sessionStorage);
      newMarriageCertificateRequest.attach(sessionStorage);

      // We need to re-render our children because the
      // birthCertificateRequest/marriageCertificateRequest changed. Since
      // there’s just one instance of this, we don’t bother changing everything
      // to use state or MobX and just force the update.
      this.pageDependencies.birthCertificateRequest = newBirthCertificateRequest;
      this.pageDependencies.marriageCertificateRequest = newMarriageCertificateRequest;

      (this as App).forceUpdate();
    }

    deathCertificateCart.attach(
      localStorage,
      deathCertificatesDao,
      siteAnalytics
    );

    orderProvider.attach(localStorage, sessionStorage);
  }

  componentWillUnmount() {
    const {
      routerListener,
      screenReaderSupport,
      orderProvider,
      birthCertificateRequest,
      marriageCertificateRequest,
    } = this.pageDependencies;

    routerListener.detach();
    screenReaderSupport.detach();
    orderProvider.detach();
    birthCertificateRequest.detach();
    marriageCertificateRequest.detach();
  }

  render() {
    const { Component, pageProps } = this.props;

    return <Component {...this.pageDependencies} {...pageProps} />;
  }
}
