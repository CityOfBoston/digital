import React from 'react';
import App, { Container } from 'next/app';
import Router from 'next/router';
import getConfig from 'next/config';
import cookies from 'next-cookies';
import { hydrate } from 'emotion';

import {
  FetchGraphql,
  makeFetchGraphql,
  RouterListener,
  NextContext,
  GtagSiteAnalytics,
  ScreenReaderSupport,
} from '@cityofboston/next-client-common';

import { ExtendedIncomingMessage } from '@cityofboston/hapi-next';

import CrumbContext from '../client/CrumbContext';
import { RedirectError } from '../client/auth-helpers';

/**
 * Our App’s getInitialProps automatically calls the page’s getInitialProps with
 * an instance of this class as the second argument, after the Next context.
 */
export interface GetInitialPropsDependencies {
  fetchGraphql: FetchGraphql;
}

export type GetInitialProps<T> = (
  cxt: NextContext<ExtendedIncomingMessage>,
  deps: GetInitialPropsDependencies
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
  fetchGraphql: FetchGraphql;
  screenReaderSupport: ScreenReaderSupport;
}

interface AppInitialProps {
  ctx: NextContext<ExtendedIncomingMessage>;
  Component: any;
}

interface InitialProps {
  pageProps: any;
  serverCrumb: string;
}

interface Props extends InitialProps {
  Component: any;
}

interface State {
  /** We have to keep the crumb in state because after the initial server-side
   * render, getInitialProps is unable to read it off of the cookies. */
  crumb: string;
}

/**
 * Custom app wrapper for setting up global dependencies:
 *
 *  - GetInitialPropsDependencies are passed as a second argument to getInitialProps
 *  - PageDependencies are spread as props for the page
 */
export default class AccessBostonApp extends App {
  // TypeScript doesn't know that App already has a props member.
  protected props: Props;
  protected state: State;

  private pageDependencies: PageDependencies;

  static async getInitialProps({
    Component,
    ctx,
  }: AppInitialProps): Promise<InitialProps> {
    const initialPageDependencies: GetInitialPropsDependencies = {
      fetchGraphql: makeFetchGraphql(getConfig(), ctx.req),
    };

    // Crumb is our XSRF token from the Hapi plugin. It's only available on the
    // server.
    const { crumb } = ctx.req ? cookies(ctx) : { crumb: '' };

    try {
      const pageProps = Component.getInitialProps
        ? await Component.getInitialProps(ctx, initialPageDependencies)
        : {};

      return {
        pageProps,
        serverCrumb: crumb || '',
      };
    } catch (e) {
      let redirectUrl;

      if (e instanceof RedirectError) {
        redirectUrl = e.url;
      } else if (e.message === 'Forbidden') {
        // TODO(finh): Be more pedantic about detecting these, possibly by
        // checking the status code when doing GraphQL fetches.
        redirectUrl = '/login';
      } else {
        redirectUrl = null;
      }

      if (redirectUrl) {
        const { res } = ctx;
        if (res) {
          res.writeHead(302, { Location: redirectUrl });
          res.end();
        } else {
          window.location.href = redirectUrl;
        }

        return {
          pageProps: {},
          serverCrumb: '',
        };
      } else {
        throw e;
      }
    }
  }

  constructor(props: Props) {
    super(props);

    // We're a little hacky here because TypeScript doesn't have type
    // information about App and doesn't know it's a component and that the
    // super call above actually does this.
    this.props = props;

    // Adds server generated styles to emotion cache.
    // '__NEXT_DATA__.ids' is set in '_document.js'
    if (typeof window !== 'undefined') {
      hydrate((window as any).__NEXT_DATA__.ids);
    }

    this.state = {
      crumb: this.props.serverCrumb,
    };

    this.pageDependencies = {
      routerListener: new RouterListener(),
      fetchGraphql: makeFetchGraphql(getConfig()),
      screenReaderSupport: new ScreenReaderSupport(),
    };
  }

  componentDidMount() {
    const { routerListener, screenReaderSupport } = this.pageDependencies;

    screenReaderSupport.attach();

    routerListener.attach({
      router: Router,
      siteAnalytics: new GtagSiteAnalytics(),
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
    const { crumb } = this.state;

    return (
      <CrumbContext.Provider value={crumb}>
        <Container>
          <Component {...this.pageDependencies} {...pageProps} />
        </Container>
      </CrumbContext.Provider>
    );
  }
}
