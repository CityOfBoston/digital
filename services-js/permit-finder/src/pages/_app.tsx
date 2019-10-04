import React from 'react';
import App, { AppProps, AppContext, AppInitialProps } from 'next/app';
import Router from 'next/router';
import getConfig from 'next/config';
import { NextPageContext } from 'next';

import {
  FetchGraphql,
  makeFetchGraphql,
  RouterListener,
  GtagSiteAnalytics,
  ScreenReaderSupport,
  SiteAnalytics,
} from '@cityofboston/next-client-common';

/**
 * Our App’s getInitialProps automatically calls the page’s getInitialProps with
 * an instance of this class as the second argument, after the Next context.
 */
export interface GetInitialPropsDependencies {
  fetchGraphql: FetchGraphql;
}

export type GetInitialProps<
  T,
  C extends keyof NextPageContext = never,
  D extends keyof GetInitialPropsDependencies = never
> = (
  cxt: Pick<NextPageContext, C>,
  deps: Pick<GetInitialPropsDependencies, D>
) => T | Promise<T>;

export class RedirectError extends Error {
  url: string;

  constructor(url: string) {
    super();

    this.url = url;
  }
}

/**
 * These props are automatically given to any Pages in the app. While magically
 * providing Props out of nowhere is a bit hard to follow, this pattern seems to
 * have the best combination of allowing Pages to be explicit about their
 * dependencies for testing purposes while avoiding too much boilerplate of
 * wrapper components and Context.Consumer render props.
 *
 * To use this:
 *
 * interface InitialProps {foo: string; bar: string[];
 * }
 *
 * interface Props extends InitialProps, Pick<PageDependencies, 'fetchGraphql'>
 * {}
 *
 * class MyPage extends React.Component<Props> {static getInitialProps:
 *   GetInitialProps<InitialProps> = async (ctx, initialDeps) => {
 *     ...
 *   }
 *
 *   handleAction: () => {this.props.fetchGraphql(…);
 *   }
 * }
 */
export interface PageDependencies {
  routerListener: RouterListener;
  siteAnalytics: SiteAnalytics;
  fetchGraphql: FetchGraphql;
  screenReaderSupport: ScreenReaderSupport;
}

/**
 * Custom app wrapper for setting up global dependencies:
 *
 *  - GetInitialPropsDependencies are passed as a second argument to getInitialProps
 *  - PageDependencies are spread as props for the page
 */
export default class AccessBostonApp extends App {
  private pageDependencies: PageDependencies;

  static async getInitialProps({
    Component,
    ctx,
  }: AppContext): Promise<AppInitialProps> {
    try {
      const initialPageDependencies: GetInitialPropsDependencies = {
        fetchGraphql: makeFetchGraphql(getConfig(), ctx.req),
      };

      const pageProps = Component.getInitialProps
        ? await (Component.getInitialProps as GetInitialProps<
            any,
            keyof NextPageContext,
            keyof GetInitialPropsDependencies
          >)(ctx, initialPageDependencies)
        : {};

      return { pageProps };
    } catch (e) {
      if (e instanceof RedirectError) {
        const redirectUrl = e.url;

        const { res } = ctx;
        if (res) {
          res.writeHead(302, { Location: redirectUrl });
          res.end();
        } else {
          window.location.href = redirectUrl;
        }

        return { pageProps: {} };
      } else {
        throw e;
      }
    }
  }

  constructor(props: AppProps<any>) {
    super(props);

    this.pageDependencies = {
      routerListener: new RouterListener(),
      siteAnalytics: new GtagSiteAnalytics(),
      fetchGraphql: makeFetchGraphql(getConfig()),
      screenReaderSupport: new ScreenReaderSupport(),
    };
  }

  componentDidMount() {
    const {
      routerListener,
      screenReaderSupport,
      siteAnalytics,
    } = this.pageDependencies;

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
  }

  componentWillUnmount() {
    const { routerListener, screenReaderSupport } = this.pageDependencies;

    routerListener.detach();
    screenReaderSupport.detach();
  }

  render() {
    const { Component, pageProps } = this.props;

    return <Component {...this.pageDependencies} {...pageProps} />;
  }
}
