// @flow

// Mixin to set up a store from initial values.
import 'core-js/shim';

import svg4everybody from 'svg4everybody';

import React, { type ComponentType as ReactComponentType } from 'react';
import type { Context } from 'next';
import { runInAction } from 'mobx';

import type { RequestAdditions } from '../../server/next-handlers';

import makeLoopbackGraphql, {
  setClientCache,
} from '../../data/dao/loopback-graphql';
import getStore, { type AppStore } from '../../data/store';

if (process.browser) {
  svg4everybody();
}

type InitialPropsExtension = {
  initialStoreState: ?{ [key: string]: mixed },
  loopbackGraphqlCache: ?{ [key: string]: Object },
};

type PropsExtension = {
  store: AppStore,
};

export default <Props: {}>(
  Component: ReactComponentType<Props & PropsExtension>
): ReactComponentType<Props> =>
  class WithStore extends React.Component<Props> {
    store: AppStore;

    static async getInitialProps(
      ctx: Context<RequestAdditions>,
      ...rest
    ): Promise<InitialPropsExtension> {
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

      // Hack to get the data we added with getInitialProps w/o trying to make
      // it a Prop on all child components.
      const initialProps: InitialPropsExtension = (props: any);

      if (initialProps.initialStoreState) {
        runInAction('withStore initialization', () => {
          Object.assign(this.store, initialProps.initialStoreState);
        });
      }

      if (initialProps.loopbackGraphqlCache) {
        setClientCache(initialProps.loopbackGraphqlCache);
      }
    }

    render() {
      return <Component store={this.store} {...this.props} />;
    }
  };
