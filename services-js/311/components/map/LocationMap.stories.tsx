import React from 'react';
import { storiesOf } from '@storybook/react';
import inPercy from '@percy-io/in-percy';
import LocationMap from './LocationMap';
import { AppStore } from '../../data/store';

const makeStore = () => {
  return new AppStore();
};

const stories = storiesOf('LocationMap', module);
const L = require('mapbox.js');

// Mapbox maps are too visually flaky to use with Percy
if (!inPercy() && process.env.NODE_ENV !== 'test') {
  stories
    .add('leaflet picker', () => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LocationMap L={L} store={makeStore()} mode="picker" mobile={false} />
      </div>
    ))
    .add('inactive', () => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LocationMap L={L} store={makeStore()} mode="inactive" mobile={false} />
      </div>
    ))
    .add('picker', () => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LocationMap L={L} store={makeStore()} mode="picker" mobile={false} />
      </div>
    ));
}
