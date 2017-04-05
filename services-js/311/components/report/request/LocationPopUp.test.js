// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

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
    store.requestForm.locationInfo.address = '';

    const component = renderer.create(
      <LocationPopUp store={store} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders with an address', () => {
    store.requestForm.locationInfo.address = 'City Hall Square\nBoston, MA';
    const component = renderer.create(
      <LocationPopUp store={store} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

test('searching', () => {
  const store = new AppStore();

  const wrapper = mount(
    <LocationPopUp store={store} {...ACTIONS} />,
  );

  const inputWrapper = wrapper.find('input[type="text"]').first();
  inputWrapper.simulate('input', { target: { value: 'City Hall' } });
  expect(inputWrapper.getDOMNode().value).toEqual('City Hall');

  ACTIONS.addressSearch.mockReturnValue(true);
  wrapper.find('form').simulate('submit');
  expect(ACTIONS.addressSearch).toHaveBeenCalledWith('City Hall');
});
