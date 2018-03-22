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

import FeedbackForm from '../../components/common/FeedbackForm';

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

type State = {|
  feedbackFormVisible: boolean,
|};

export default <Props: {}>(
  Component: ReactComponentType<Props & PropsExtension>
): ReactComponentType<Props> =>
  class WithStore extends React.Component<Props, State> {
    state: State = {
      feedbackFormVisible: false,
    };

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
        (runInAction: any)('withStore initialization', () => {
          Object.assign(this.store, initialProps.initialStoreState);
        });
      }

      if (initialProps.loopbackGraphqlCache) {
        setClientCache(initialProps.loopbackGraphqlCache);
      }
    }

    showFeedbackForm = (ev: Event) => {
      ev.preventDefault();
      this.setState({ feedbackFormVisible: true });
    };

    hideFeedbackForm = () => this.setState({ feedbackFormVisible: false });

    getFeedbackLink() {
      return document.querySelector('a.nv-h-l-a[title="Feedback"]');
    }

    componentDidMount() {
      const feedbackLink = this.getFeedbackLink();
      if (feedbackLink) {
        feedbackLink.addEventListener('click', this.showFeedbackForm);
      }
    }

    componentWillUnmount() {
      const feedbackLink = this.getFeedbackLink();
      if (feedbackLink) {
        feedbackLink.removeEventListener('click', this.showFeedbackForm);
      }
    }

    render() {
      const { feedbackFormVisible } = this.state;

      return (
        <div>
          <Component store={this.store} {...this.props} />
          {feedbackFormVisible &&
            <FeedbackForm close={this.hideFeedbackForm} />}
        </div>
      );
    }
  };
