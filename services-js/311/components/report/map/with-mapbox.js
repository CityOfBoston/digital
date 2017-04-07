// @flow

import React from 'react';

type LWithMapbox = $Exports<'mapbox.js'>;

let L: ?LWithMapbox = null;
if (process.browser) {
  L = require('mapbox.js');
}

// HOC for including the correct Mapbox lib. We can only run this on the
// client because Mapbox libs try to attach to window, which doesn't work
// with SSR.
export default () => (Component: Class<React.Component<*, *, *>>) => (
  class withMapbox extends React.Component {
    props: Object;

    state: {
      L: ?LWithMapbox,
    }

    constructor(props: Object) {
      super(props);

      this.state = {
        L: null,
      };
    }

    componentDidMount() {
      if (L) {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ L });
      }
    }

    render() {
      if (this.state.L) {
        return <Component L={this.state.L} {...this.props} />;
      } else {
        return null;
      }
    }
  }
);
