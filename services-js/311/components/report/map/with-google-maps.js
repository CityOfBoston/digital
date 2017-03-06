// @flow
/* global google */
/* eslint no-underscore-dangle: 0 */

// Higher-order component to load the Google Maps API for its wrapped component
// and pass it in the googleMaps prop. Only renders its child if google.maps is
// available.
//
// During SSR, this should add a Google Maps <script> to the <head>. It also
// needs to be tolerant of mounting from SSR with Google Maps already loaded,
// since in practice the <script> can end up executing before the app JS loads.

import URLSearchParams from 'url-search-params';

import React from 'react';
import Head from 'next/head';

type Props = {
  googleApiKey: string,
};

const CALLBACKS_ARRAY_NAME = '__withGoogleMaps__CALLBACKS';
const CALLBACK_NAME = '__withGoogleMaps__CALLBACK';

// Written in the page during SSR for the case where Google Maps API loads before
// the React app has booted up. This keeps Google Maps from calling an undefined
// function.
//
// We use an array of our component callbacks that this function calls because
// the Google API dereferences the calback value early in the load but doesn't
// call it until later, so changing the callback during the loading process
// won't get called.
const STATIC_CALLBACK_SCRIPT = `
  window.${CALLBACKS_ARRAY_NAME} = window.${CALLBACKS_ARRAY_NAME} || [];
  window.${CALLBACK_NAME} = function() {
    for (var i = 0; i !== ${CALLBACKS_ARRAY_NAME}.length; i += 1) {
      ${CALLBACKS_ARRAY_NAME}[i]();
    }
  };
`;

export default (libraries: string[] = []) => (Component: Class<React.Component<*, *, *>>) => (
  class withGoogleMaps extends React.Component {
    props: Props;

    state: {
      mapsLoaded: boolean,
    }

    constructor(props: Props) {
      super(props);

      this.state = {
        // ensures that initial rendering on both server and client will be
        // of a <Head> element, in order to match during client boot.
        mapsLoaded: false,
      };
    }

    componentDidMount() {
      if (typeof google !== 'undefined' && google.maps) {
        // We explicitly do a setState in componentDidMount because coming
        // off of an SSR we want to render the empty <Head> element to make the
        // client HTML the same as the server’s. But, if the Maps API is loaded,
        // we can immediately switch that out for the child component.
        //
        // We follow this stategy so that we only render Component if the maps
        // API is loaded, so that it can have simpler logic.
        this.mapsLibraryLoaded();
      } else {
        window[CALLBACKS_ARRAY_NAME] = [...(window[CALLBACKS_ARRAY_NAME] || []), this.mapsLibraryLoaded];
      }
    }

    componentWillUnmount() {
      window[CALLBACKS_ARRAY_NAME] = (window[CALLBACKS_ARRAY_NAME] || []).filter((f) => f !== this.mapsLibraryLoaded);
    }

    mapsLibraryLoaded = () => {
      this.setState({ mapsLoaded: true });
    }

    render() {
      const { googleApiKey } = this.props;
      const { mapsLoaded } = this.state;

      // Distinct from mapsLoaded to handle the case where the <script> is on
      // the page due to server-side rendering.
      const needsScript = typeof window === 'undefined' || !window[CALLBACK_NAME];

      const mapsApiParams = new URLSearchParams();
      mapsApiParams.append('key', googleApiKey || '');
      mapsApiParams.append('libraries', (libraries || []).join(','));
      mapsApiParams.append('callback', CALLBACK_NAME);

      const mapsApiSrc = `https://maps.googleapis.com/maps/api/js?${mapsApiParams.toString()}`;

      if (mapsLoaded) {
        return <Component googleMaps={google.maps} {...this.props} />;
      } else {
        return (
          <Head>
            { needsScript && <script type="text/javascript">{STATIC_CALLBACK_SCRIPT}</script> }
            { needsScript && <script async defer src={mapsApiSrc} /> }
          </Head>
        );
      }
    }
  }
);
