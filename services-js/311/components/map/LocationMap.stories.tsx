import React from 'react';
import { storiesOf } from '@storybook/react';
import inPercy from '@percy-io/in-percy';
import LocationMap, { Props, MapMode } from './LocationMap';
import AddressSearch from '../../data/store/AddressSearch';
import BrowserLocation from '../../data/store/BrowserLocation';
import RequestSearch from '../../data/store/RequestSearch';
import Ui from '../../data/store/Ui';

const L = require('mapbox.js');

const makeDefaultProps = (mode: MapMode): Props => {
  return {
    L,
    addressSearch: new AddressSearch(),
    browserLocation: new BrowserLocation(),
    requestSearch: new RequestSearch(),
    ui: new Ui(),
    mode,
    mobile: false,
  };
};

const stories = storiesOf('LocationMap', module);

// Mapbox maps are too visually flaky to use with Percy
if (!inPercy() && process.env.NODE_ENV !== 'test') {
  stories
    .add('picker', () => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LocationMap {...makeDefaultProps('picker')} />
      </div>
    ))
    .add('inactive', () => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LocationMap {...makeDefaultProps('inactive')} />
      </div>
    ));
}
