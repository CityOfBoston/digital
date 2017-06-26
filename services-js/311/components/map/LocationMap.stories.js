// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import inPercy from '@percy-io/in-percy';
import LocationMap from './LocationMap';
import { AppStore } from '../../data/store';

const makeStore = () => {
  const store = new AppStore();
  store.apiKeys = window.API_KEYS;
  return store;
};

const stories = storiesOf('LocationMap', module);

// Mapbox maps are too visually flaky to use with Percy
if (!inPercy() && process.env.NODE_ENV !== 'test') {
  stories.add('leaflet picker', () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LocationMap L={require('mapbox.js')} mapboxgl={null} store={makeStore()} mode="picker" mobile={false} />
    </div>
  ))
  .add('inactive', () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LocationMap L={null} mapboxgl={require('mapbox-gl')} store={makeStore()} mode="inactive" mobile={false} />
    </div>
  ))
  .add('picker', () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LocationMap L={null} mapboxgl={require('mapbox-gl')} store={makeStore()} mode="picker" mobile={false} />
    </div>
  ));
}

