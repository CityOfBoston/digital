// Mixin to set up a store from initial values.
import 'core-js/shim';
import svg4everybody from 'svg4everybody';
import React, { ComponentType as ReactComponentType } from 'react';
import { Context } from 'next';
import { runInAction } from 'mobx';
import { RequestAdditions } from '../../server/next-handlers';
import makeLoopbackGraphql, {
  setClientCache,
} from '../../data/dao/loopback-graphql';
import getStore, { AppStore } from '../../data/store';

if (process.browser) {
  svg4everybody();
}

interface InitialPropsExtension {
  initialStoreState: { [key: string]: {} } | undefined;
  loopbackGraphqlCache: { [key: string]: any } | undefined;
}

interface PropsExtension {
  store: AppStore;
}

export default <Props extends {}>(
  Component: ReactComponentType<Props & PropsExtension>
): ReactComponentType<Props> =>
  class WithStore extends React.Component<Props> {
    public readonly store: AppStore;

    public static async getInitialProps(
      ctx: Context<RequestAdditions>,
      ...rest
    ): Promise<InitialPropsExtension> {
      const { req } = ctx;

      let initialProps;
      if (typeof (Component as any).getInitialProps === 'function') {
        initialProps = await (Component as any).getInitialProps(ctx, ...rest);
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
      const initialProps: InitialPropsExtension = props as any;

      if (initialProps.initialStoreState) {
        (runInAction as any)('withStore initialization', () => {
          Object.assign(this.store, initialProps.initialStoreState);
        });
      }

      if (initialProps.loopbackGraphqlCache) {
        setClientCache(initialProps.loopbackGraphqlCache);
      }
    }
    public readonly showFeedbackForm = (ev: Event) => {
      ev.preventDefault();
      const contactFormEl: any = document.getElementById('contactForm');
      if (contactFormEl) {
        contactFormEl.show();
      }
    };

    public getFeedbackLink() {
      return document.querySelector('a.nv-h-l-a[title="Feedback"]');
    }

    public componentDidMount() {
      const feedbackLink = this.getFeedbackLink();
      if (feedbackLink) {
        feedbackLink.addEventListener('click', this.showFeedbackForm);
      }
    }

    public componentWillUnmount() {
      const feedbackLink = this.getFeedbackLink();
      if (feedbackLink) {
        feedbackLink.removeEventListener('click', this.showFeedbackForm);
      }
    }

    public render() {
      return (
        <div>
          <Component store={this.store} {...this.props} />
        </div>
      );
    }
  };
