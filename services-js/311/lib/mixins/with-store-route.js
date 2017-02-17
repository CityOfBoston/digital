// @flow

/* eslint react/no-unused-prop-types: 0 */

import React from 'react';
import type { Context } from 'next';
import Router from 'next/router';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import type { RequestAdditions } from '../../server/next-handlers';
import getStore from '../../data/store';
import type { State, Action, Store } from '../../data/store';

import { setRoute } from '../../data/store/route';

// If we're running under Jest for testing, fakes handling change of query
// for the same route by calling the component's getInitialProps again and
// re-rendering.
const TEST_MODE = process.env.NODE_ENV === 'test';

const mapStateToProps = ({ route: { pathname, query, as } }: State) => ({
  withStoreRoute_pathname: pathname,
  withStoreRoute_query: query,
  withStoreRoute_as: as,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchSetRoute: (pathname, query, as) => dispatch(setRoute(pathname, query, as)),
});

const makeQueryString = (query) => (
  Object.entries(query).map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`).join('&')
);

/**
 * Higher-order component that synchronizes between the Redux store and Next.js’s
 * router. Expected to be wrapped by withStore so that the store is available to
 * getInitialProps.
 */
export default (Component: Class<React.Component<*, *, *>>) => {
  const getChildInitialProps = (typeof Component.getInitialProps === 'function') ? Component.getInitialProps.bind(Component) : () => {};

  return connect(mapStateToProps, mapDispatchToProps)(
    class withStoreRoute extends React.Component {
      state: {
        childProps: Object,
      }

      props: {
        withStoreRoute_pathname: string,
        withStoreRoute_query: {[key: string]: string},
        withStoreRoute_as: ?string,
      }

      static getInitialProps(ctx: Context<RequestAdditions>, store: Store) {
        const { pathname, query } = ctx;

        // Note that when this is called, the window’s location field is still the
        // path that we are coming from, which is why we don’t attempt to synchronize
        // “as” from the Router to Redux.
        store.dispatch(setRoute(pathname, query));

        return getChildInitialProps(ctx, store);
      }

      constructor(props: Object) {
        super(props);

        if (TEST_MODE) {
          this.state = { childProps: props };
        }
      }

      componentWillReceiveProps(newProps) {
        if (this.props.withStoreRoute_as === null && newProps.withStoreRoute_as !== null) {
          if (TEST_MODE) {
            if (newProps.withStoreRoute_pathname !== this.props.withStoreRoute_pathname) {
              throw new Error(`Cannot change pathnames (${this.props.withStoreRoute_pathname} to ${newProps.withStoreRoute_pathname}) in test mode`);
            }

            const ctx = {
              pathname: newProps.withStoreRoute_pathname,
              query: newProps.withStoreRoute_query,
            };

            Promise.resolve(getChildInitialProps(ctx, getStore())).then((newChildProps) => {
              this.setState({ childProps: newChildProps });
            });
          } else {
            Router.push(`${newProps.withStoreRoute_pathname}?${makeQueryString(newProps.withStoreRoute_query)}`, newProps.withStoreRoute_as);
          }
        }
      }

      render() {
        const childProps = TEST_MODE ? this.state.childProps : this.props;

        return <Component {...childProps} />;
      }
    },
  );
};
