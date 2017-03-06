// @flow

// Mixin to hydrate Glamor IDs before requiring the component and rendering it.
//
// Pass this mixin a function that requires the component class and returns it.
// require is necessary rather than import since imports are hoisted to the
// beginning of files, and we need to rehydrate before any Glamor "css"
// statements are processed.

import React from 'react';
import { rehydrate } from 'glamor';

export default <OP, P: $Subtype<Object>, S> (componentFn: () => Class<React.Component<OP, P, S>>): Class<React.Component<void, P, void>> => {
  if (process.browser) {
    // eslint-disable-next-line no-underscore-dangle
    rehydrate(window.__NEXT_DATA__.ids);
  }

  const Component = componentFn();

  return class extends React.Component {
    props: P;

    static getInitialProps(...args) {
      if (typeof Component.getInitialProps === 'function') {
        return Component.getInitialProps(...args);
      } else {
        return null;
      }
    }

    render() {
      return <Component {...this.props} />;
    }
  };
};
