// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import * as L from 'leaflet';

import { AppStore } from '../../../data/store';

import LocationMap from './LocationMap';

const FAKE_MAPBOX_L = {
  ...L,
  mapbox: {
    map: (el, tiles, options) => L.map(el, options),
  },
};

test('rendering active', () => {
  const store = new AppStore();
  const component = renderer.create(
    <LocationMap
      store={store}
      L={FAKE_MAPBOX_L}
      mode="picker"
      opacityRatio={1}
    />,
    { createNodeMock: () => document.createElement('div') },
  );
  expect(component.toJSON()).toMatchSnapshot();
});
