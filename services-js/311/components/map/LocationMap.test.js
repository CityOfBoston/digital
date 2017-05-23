// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { runInAction } from 'mobx';

import { AppStore } from '../../data/store';

import type LocationMapClass from './LocationMap';

let LocationMap: Class<LocationMapClass>;

let previousBrowserValue;

beforeAll(() => {
  previousBrowserValue = process.browser;
  process.browser = true;

  // We need these shenanigans to get LocationMap loaded with process.browser
  // true, so that it requires leaflet, which can't be required server-side.
  LocationMap = require.requireActual('./LocationMap').default;
});

afterAll(() => {
  process.browser = previousBrowserValue;
});

test('rendering active', () => {
  const store = new AppStore();
  store.apiKeys.mapbox = {
    accessToken: 'FAKE_MAPBOX_ACCESS_TOKEN',
    styleUrl: 'mapbox://styles/fake-style',
  };

  const component = renderer.create(
    <LocationMap
      L={require('mapbox.js')}
      store={store}
      mode="picker"
      mobile={false}
    />,
    { createNodeMock: () => document.createElement('div') },
  );
  expect(component.toJSON()).toMatchSnapshot();
});

describe('mounted map', () => {
  let store;
  let wrapper;
  let locationMap: LocationMap;

  beforeEach(() => {
    store = new AppStore();
    store.apiKeys.mapbox = {
      accessToken: 'FAKE_MAPBOX_ACCESS_TOKEN',
      styleUrl: 'mapbox://styles/fake-style',
    };

    wrapper = mount(
      <LocationMap
        L={require('mapbox.js')}
        store={store}
        mode="picker"
        mobile={false}
      />,
    );

    locationMap = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('positions a marker based on the form location', () => {
    runInAction(() => {
      store.mapLocation.address = '1 City Hall Plaza';
      store.mapLocation.location = {
        lat: 42.36035940296916,
        lng: -71.05802536010744,
      };
    });

    const { requestMarker } = locationMap;
    if (!requestMarker) {
      expect(locationMap.requestMarker).toBeDefined();
      return;
    }

    const markerLatLng = requestMarker.getLatLng();
    expect(markerLatLng.lat).toEqual(42.36035940296916);
    expect(markerLatLng.lng).toEqual(-71.05802536010744);
  });
});
