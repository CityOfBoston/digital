// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../../data/store';
import LocationPopUp from './LocationPopUp';

const ACTIONS = {
  addressSearch: jest.fn(),
  nextFunc: jest.fn(),
};

describe('rendering', () => {
  let store;

  beforeEach(() => {
    store = new AppStore();
  });

  it('renders without an address', () => {
    store.locationInfo.address = '';

    const component = renderer.create(
      <LocationPopUp store={store} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders with an address', () => {
    store.locationInfo.address = 'City Hall Square\nBoston, MA';
    const component = renderer.create(
      <LocationPopUp store={store} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
