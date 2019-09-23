import svg4everybody from 'svg4everybody';
import React from 'react';
import App, { Container } from 'next/app';
import Router from 'next/router';
import getConfig from 'next/config';
import { configure as mobxConfigure } from 'mobx';
import { hydrate, cache as emotionCache } from 'emotion';
import { CacheProvider } from '@emotion/core';

import {
  makeFetchGraphql,
  NextContext,
  ScreenReaderSupport,
  RouterListener,
  GaSiteAnalytics,
  FetchGraphql,
  GraphqlCache,
} from '@cityofboston/next-client-common';

import RequestSearch from '../data/store/RequestSearch';
import Ui from '../data/store/Ui';
import BrowserLocation from '../data/store/BrowserLocation';
import AddressSearch from '../data/store/AddressSearch';
import AllServices from '../data/store/AllServices';
import LiveAgent from '../data/store/LiveAgent';
import parseLanguagePreferences, {
  LanguagePreference,
} from '../data/store/BrowserLanguage';
import { NextConfig } from '../lib/config';
import { IncomingMessage } from 'http';

// Adds server generated styles to emotion cache.
// '__NEXT_DATA__.ids' is set in '_document.js'
if (typeof window !== 'undefined') {
  hydrate((window as any).__NEXT_DATA__.ids);
}

/**
 * Our App’s getInitialProps automatically calls the page’s getInitialProps with
 * an instance of this interface as the second argument, after the Next context.
 */
export interface GetInitialPropsDependencies {
  fetchGraphql: FetchGraphql;
  fetchGraphqlCache: GraphqlCache;
}

/**
 * Generic type for a page’s GetInitialProps. Has built-in "Pick" types so that
 * a function can declare the minimum fields of NextContext and
 * GetInitialPropsDependencies that it cares about. That way tests only need to
 * supply relevant values.
 */
export type GetInitialProps<
  T,
  C extends keyof NextContext = never,
  D extends keyof GetInitialPropsDependencies = never
> = (
  cxt: Pick<NextContext, C>,
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
export interface PageDependencies {
  addressSearch: AddressSearch;
  allServices: AllServices;
  browserLocation: BrowserLocation;
  fetchGraphql: FetchGraphql;
  languages: LanguagePreference[];
  liveAgent: LiveAgent;
  requestSearch: RequestSearch;
  routerListener: RouterListener;
  screenReaderSupport: ScreenReaderSupport;
  siteAnalytics: GaSiteAnalytics;
  ui: Ui;
}

interface AppGetInitialPropsContext {
  ctx: NextContext;
  Component: any;
}

interface InitialProps {
  pageProps: any;
  fetchGraphqlCache: GraphqlCache;
  languages: LanguagePreference[];
}

interface Props extends InitialProps {
  Component: any;
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
  const cache: GraphqlCache = {};
  const fetchGraphql = makeFetchGraphql(config, req, cache);

  const initialPageDependencies: GetInitialPropsDependencies = {
    fetchGraphql,
    fetchGraphqlCache: cache,
  };

  if (process.browser) {
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
export default class Three11App extends App<Props | any> {
  // TypeScript doesn't know that App already has a props member.
  props: Props | any;

  private pageDependencies: PageDependencies;

  static async getInitialProps({
    Component,
    ctx,
  }: AppGetInitialPropsContext | any): Promise<InitialProps> {
    const deps = getInitialPageDependencies(ctx.req);

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx, deps)
      : {};

    return {
      pageProps,
      fetchGraphqlCache: deps.fetchGraphqlCache,
      // This only has useful values on the server, so we’ll save it off in the
      // constructor.
      languages: parseLanguagePreferences(ctx.req),
    };
  }

  constructor(props: Props | any) {
    super(props);

    // We're a little hacky here because TypeScript doesn't have type
    // information about App and doesn't know it's a component and that the
    // super call above actually does this.
    this.props = props;

    mobxConfigure({ enforceActions: true });

    if (process.browser) {
      svg4everybody();
    }

    const config: NextConfig = getConfig();

    // In the browser, this is called before it's ever called in a
    // getInitialProps (because the getInitialProps call is server-side for the
    // first load). We "prime" the cache by pulling in what we got from our
    // props, which is the export of the server-side getInitialProps.
    const deps = getInitialPageDependencies();
    Object.assign(deps.fetchGraphqlCache, props.fetchGraphqlCache);

    this.pageDependencies = {
      routerListener: new RouterListener(),
      screenReaderSupport: new ScreenReaderSupport(),
      siteAnalytics: new GaSiteAnalytics(),
      requestSearch: new RequestSearch(),
      addressSearch: new AddressSearch(),
      allServices: new AllServices(),
      browserLocation: new BrowserLocation(),
      fetchGraphql: deps.fetchGraphql,
      liveAgent: new LiveAgent(config.publicRuntimeConfig.liveAgentButtonId),
      ui: new Ui(),
      // In the app’s constructor, the props are from the server-side
      // getInitialProps execution. As the user navigates from page to page,
      // getInitialProps will be called again, but the App component will
      // receive them as new props, rather than be re-constructed.
      //
      // So, by saving the prop here, we can keep the server-side value
      // throughout the lifetime of the app on the client.
      languages: this.props.languages,
    };
  }

  componentDidMount() {
    const {
      routerListener,
      screenReaderSupport,
      siteAnalytics,
      ui,
      fetchGraphql,
      browserLocation,
      liveAgent,
    } = this.pageDependencies;

    try {
      ui.attach();
      browserLocation.attach(fetchGraphql);
      liveAgent.attach();

      screenReaderSupport.attach();
      routerListener.attach({
        router: Router,
        siteAnalytics,
        screenReaderSupport,
      });

      // Used by testcafe-helpers as a signal that React is running and has
      // rendered the page. Used to ensure we don’t try to interact before the JS
      // has loaded.
      (window as any).APP_RUNNING = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Error in component will mount', e);
      throw e;
    }
  }

  componentWillUnmount() {
    const {
      routerListener,
      screenReaderSupport,
      ui,
      browserLocation,
    } = this.pageDependencies;

    routerListener.detach();
    screenReaderSupport.detach();
    ui.detach();
    browserLocation.detach();
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <CacheProvider value={emotionCache}>
        <Container>
          <Component {...this.pageDependencies} {...pageProps} />
        </Container>
      </CacheProvider>
    );
  }
}
