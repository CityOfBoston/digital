// @flow

// Mixin to hydrate Emotion IDs before requiring the component and rendering it.
//
// Pass this mixin a function that requires the component class and returns it.
// require is necessary rather than import since imports are hoisted to the
// beginning of files, and we need to rehydrate before any Glamor "css"
// statements are processed.

import React, { type ComponentType as ReactComponentType } from 'react';
import { hydrate } from 'emotion';

export default <Props: {}>(
  componentFn: () => ReactComponentType<Props>
): ReactComponentType<Props> => {
  if (process.browser) {
    // eslint-disable-next-line no-underscore-dangle
    hydrate(window.__NEXT_DATA__.ids);
  }

  const Component = componentFn();

  return class WithEmotion extends React.Component<Props> {
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
