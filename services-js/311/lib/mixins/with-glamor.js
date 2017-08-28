// @flow

// Mixin to hydrate Glamor IDs before requiring the component and rendering it.
//
// Pass this mixin a function that requires the component class and returns it.
// require is necessary rather than import since imports are hoisted to the
// beginning of files, and we need to rehydrate before any Glamor "css"
// statements are processed.

import * as React from 'react';
import { rehydrate } from 'glamor';

export default <Props: {}>(
  componentFn: () => React.ComponentType<Props>
): React.ComponentType<Props> => {
  if (process.browser) {
    // eslint-disable-next-line no-underscore-dangle
    rehydrate(window.__NEXT_DATA__.ids);
  }

  const Component = componentFn();

  return class WithGlamor extends React.Component<Props> {
    // Need to pass this through for Next
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
