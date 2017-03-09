// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../../data/store';

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

test('rendering active', () => {
  const store = new AppStore();
  const component = renderer.create(
    <LocationMap
      store={store}
      googleMaps={FAKE_GOOGLE_MAPS}
      setLocationMapSearch={jest.fn()}
    />,
    { createNodeMock: () => 'FAKE-NODE-ELEMENT' },
  );
  expect(component.toJSON()).toMatchSnapshot();
});
