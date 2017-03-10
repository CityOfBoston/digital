// @flow

// Mixin to set up a store from initial values.

import React from 'react';
import type { Context } from 'next';
import { runInAction } from 'mobx';

import type { RequestAdditions } from '../../server/next-handlers';

import getStore from '../../data/store';
import type { AppStore } from '../../data/store';

export default <OP, P: $Subtype<Object>, S> (Component: Class<React.Component<OP, P, S>>): Class<React.Component<void, P, void>> => class extends React.Component {
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

    return {
      ...initialProps,
      initialStoreState: req ? { apiKeys: req.apiKeys } : null,
    };
  }

  constructor(props) {
    super(props);

    this.store = getStore();

    if (props.initialStoreState) {
      runInAction('withStore initialization', () => {
        Object.assign(this.store, props.initialStoreState);
      });
    }
  }

  render() {
    return <Component store={this.store} {...this.props} />;
  }
};
