// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import LocationPopUp from './LocationPopUp';

const ACTIONS = {
  addressSearch: jest.fn(),
  next: jest.fn(),
};

describe('rendering', () => {
  it('renders without an address', () => {
    const component = renderer.create(
      <LocationPopUp address={''} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders with an address', () => {
    const component = renderer.create(
      <LocationPopUp address={'City Hall Square\nBoston, MA'} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
