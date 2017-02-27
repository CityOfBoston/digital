// @flow

import React from 'react';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import type { Context } from 'next';

/**
 * Higher-order React component that initializes our Redux store and preserves its
 * server-side state for the initial client rendering. Wraps the child component
 * in a Redux <Provider> so that connect may be used to access state and dispatch.
 *
 * All components wrapped by this will receive the Redux store as a second argument
 * to their getInitialProps static methods.
 *
 * Lifecycle:
 *  - On the server, getInitialProps is called and we create a new store that's used
 *    for calls to the wrapped component's getInitialProps. The final state of the
 *    store after getInitialProps resolves is stored as "initialState" in the returned props.
 *  - The server then constructs the component from the props and we create a fresh
 *    store object, initialized with the initialState, which powers the server render.
 *  - When the app starts on the client, getInitialProps is not called, and the store gets
 *    created in the constructor, again from the props' initialState. This store is
 *    then memoized inside the store module.
 *  - When new pages are accessed on the client, their getInitialProps and constructors
 *    will received the memoized store, preserving the data throughout the session.
 */
export type GetStore<R, S, A> = (req: ?R, initialState: ?S) => Store<S, A>;

export default <R, S, A> (getStore: GetStore<R, S, A>) => (Component: Class<React.Component<*, *, *>>) => (
  class withStore extends React.Component {
    store: Store<S, A>;

    static async getInitialProps(ctx: Context<R>) {
      const { req } = ctx;

      const initialState = req ? req.reduxInitialState : undefined;
      const store = getStore(req, initialState);

      const props = await (typeof Component.getInitialProps === 'function' ? Component.getInitialProps(ctx, store) : {});

      return {
        // This will now be populated due to running getInitialProps
        initialState: store.getState(),
        ...props,
      };
    }

    constructor(props: Object) {
      super(props);

      const { initialState } = props;
      this.store = getStore(null, initialState);
    }

    render() {
      return (
        <Provider store={this.store}>
          <Component {...this.props} />
        </Provider>
      );
    }
  }
);
