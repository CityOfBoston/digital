// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { runInAction } from 'mobx';

import { AppStore } from '../../../data/store';
import type { ReverseGeocodedPlace } from '../../../data/types';

import type LocationMapClass from './LocationMap';

let LocationMap: Class<LocationMapClass>;

jest.mock('../../../data/dao/reverse-geocode');
const reverseGeocode: JestMockFn = (require('../../../data/dao/reverse-geocode'): any).default;

let previousBrowserValue;

beforeAll(() => {
  previousBrowserValue = process.browser;
  process.browser = true;

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
      store={store}
      mode="picker"
      opacityRatio={1}
      loopbackGraphql={jest.fn()}
    />,
    { createNodeMock: () => document.createElement('div') },
  );
  expect(component.toJSON()).toMatchSnapshot();
});

describe('mounted map', () => {
  let store;
  let wrapper;
  let loopbackGraphql;
  let locationMap: LocationMap;
  let resolveGraphql: (place: ?ReverseGeocodedPlace) => void;

  beforeEach(() => {
    reverseGeocode.mockReturnValue(new Promise((resolve) => {
      resolveGraphql = resolve;
    }));

    loopbackGraphql = jest.fn();

    store = new AppStore();
    store.apiKeys.mapbox = {
      accessToken: 'FAKE_MAPBOX_ACCESS_TOKEN',
      styleUrl: 'mapbox://styles/fake-style',
    };

    wrapper = mount(
      <LocationMap
        store={store}
        mode="picker"
        opacityRatio={1}
        loopbackGraphql={loopbackGraphql}
      />,
    );

    locationMap = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('positions a marker based on the form location', () => {
    const { requestForm: { locationInfo } } = store;
    runInAction(() => {
      locationInfo.address = '1 City Hall Plaza';
      locationInfo.location = {
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

  it('reverse geocodes when clicking on the map', async () => {
    const { requestForm: { locationInfo } } = store;

    locationMap.handleMapClick({
      latlng: {
        lat: 42.36035940296916,
        lng: -71.05802536010744,
      },
    });

    // request marker should move synchronously with the click
    const { requestMarker } = locationMap;
    if (!requestMarker) {
      expect(locationMap.requestMarker).toBeDefined();
      return;
    }

    const markerLatLng = requestMarker.getLatLng();
    expect(markerLatLng.lat).toEqual(42.36035940296916);
    expect(markerLatLng.lng).toEqual(-71.05802536010744);

    // before reverse geocode happens
    expect(locationInfo.location).toEqual(null);
    expect(locationInfo.address).toEqual('');

    expect(reverseGeocode).toHaveBeenCalledWith(loopbackGraphql, {
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });

    await resolveGraphql({
      address: '1 City Hall Plaza',
      location: {
        lat: 42.36035940296916,
        lng: -71.05802536010744,
      },
    });

    // after reverse geocode
    expect(locationInfo.location).toEqual({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });
    expect(locationInfo.address).toEqual('1 City Hall Plaza');
  });
});
