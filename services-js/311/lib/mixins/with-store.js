// @flow

// Mixin to set up a store from initial values.
import 'core-js/shim';

import svg4everybody from 'svg4everybody';

import React from 'react';
import type { Context } from 'next';
import { runInAction } from 'mobx';

import type { RequestAdditions } from '../../server/next-handlers';

import makeLoopbackGraphql, { setClientCache } from '../../data/dao/loopback-graphql';
import getStore from '../../data/store';
import type { AppStore } from '../../data/store';

if (process.browser) {
  svg4everybody();
}

export default <OP, P: $Subtype<Object>, S>(
  Component: Class<React.Component<OP, P, S>>,
): Class<React.Component<void, P, void>> =>
  class WithStore extends React.Component {
    props: P;
    store: AppStore;

    static async getInitialProps(ctx: Context<RequestAdditions>, ...rest) {
      const { req } = ctx;

      let initialProps;
      if (typeof Component.getInitialProps === 'function') {
        initialProps = await Component.getInitialProps(ctx, ...rest);
      } else {
        initialProps = {};
      }

      const initialStoreState = req
        ? {
            apiKeys: req.apiKeys,
            languages: req.languages,
            liveAgentButtonId: req.liveAgentButtonId,
          }
        : null;

      const loopbackGraphqlCache = req ? req.loopbackGraphqlCache : null;

      // TODO(finh): If we really needed to, we could try and find the cached
      // graphQL values in the initialProps and replace them with cache keys, and
      // then do a lookup into the cache ond the other side in render().

      return {
        ...initialProps,
        initialStoreState,
        loopbackGraphqlCache,
      };
    }

    constructor(props) {
      super(props);

      this.store = getStore(makeLoopbackGraphql());

      if (props.initialStoreState) {
        runInAction('withStore initialization', () => {
          Object.assign(this.store, props.initialStoreState);
        });
      }

      if (props.loopbackGraphqlCache) {
        setClientCache(props.loopbackGraphqlCache);
      }
    }

    render() {
      return <Component store={this.store} {...this.props} />;
    }
  };
