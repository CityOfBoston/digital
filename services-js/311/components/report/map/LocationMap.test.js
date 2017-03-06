// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import LocationMap from './LocationMap';

class FakeMapsEventListener {
  remove() {}
}

class FakeGoogleMap {
  addListener() { return new FakeMapsEventListener(); }
}

class FakeAutocompleteService {}

const FAKE_GOOGLE_MAPS = {
  Map: FakeGoogleMap,
  places: {
    AutocompleteService: FakeAutocompleteService,
  },
};

const DEFAULT_PROPS = {
  active: true,
  nextFunc: jest.fn(),
  dispatchLocation: jest.fn(),
  googleMaps: FAKE_GOOGLE_MAPS,
  address: '',
  location: null,
  googleApiKey: 'fake-api-key',
  setLocationMapSearch: jest.fn(),
};

test('rendering active', () => {
  const component = renderer.create(
    <LocationMap {...DEFAULT_PROPS} />,
    { createNodeMock: () => 'FAKE-NODE-ELEMENT' },
  );
  expect(component.toJSON()).toMatchSnapshot();
});
