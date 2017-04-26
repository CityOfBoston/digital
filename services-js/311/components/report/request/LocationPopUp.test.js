// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { runInAction } from 'mobx';

import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';
import type { SearchAddressPlace } from '../../../data/types';
import LocationPopUp from './LocationPopUp';

jest.mock('../../../data/dao/search-address');
const searchAddress: JestMockFn = (require('../../../data/dao/search-address'): any).default;

const ACTIONS = {
  loopbackGraphql: jest.fn(),
  nextFunc: jest.fn(),
  nextIsSubmit: false,
};

describe('rendering', () => {
  let store;
  let requestForm;

  beforeEach(() => {
    store = new AppStore();
    store.apiKeys.mapbox = 'fake-api-key';

    requestForm = new RequestForm();
  });

  it('renders without an address', () => {
    runInAction(() => { requestForm.address = ''; });

    const component = renderer.create(
      <LocationPopUp store={store} requestForm={requestForm} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders with an address', () => {
    runInAction(() => { requestForm.address = 'City Hall Square\nBoston, MA'; });
    const component = renderer.create(
      <LocationPopUp store={store} requestForm={requestForm} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders a map on a small screen', () => {
    store.ui.visibleWidth = 320;
    const component = renderer.create(
      <LocationPopUp store={store} requestForm={requestForm} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('searching', () => {
  let store;
  let requestForm;
  let resolveGraphql: (place: ?SearchAddressPlace) => void;
  let wrapper;
  let inputWrapper;

  beforeEach(() => {
    const promise = new Promise((resolve) => {
      resolveGraphql = resolve;
    });

    searchAddress.mockReturnValue(promise);

    store = new AppStore();

    requestForm = new RequestForm();
    requestForm.address = 'Red Barn';
    requestForm.location = {
      lat: 42.360071,
      lng: -71.056413,
    };

    wrapper = mount(
      <LocationPopUp store={store} requestForm={requestForm} {...ACTIONS} />,
    );

    inputWrapper = wrapper.find('input[type="text"]').first();
    inputWrapper.simulate('input', { target: { value: '121 devonshire' } });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('updates LocationInfo and clears search on success', async () => {
    wrapper.find('form').simulate('submit');
    expect(searchAddress).toHaveBeenCalledWith(ACTIONS.loopbackGraphql, '121 devonshire');

    await resolveGraphql({
      address: '121 Devonshire Street, Boston, MA, 02108',
      location: {
        lat: 42.35700999905103,
        lng: -71.05761000345488,
      },
    });

    expect(requestForm.address).toEqual('121 Devonshire Street, Boston, MA, 02108');
    expect(requestForm.location).toEqual({
      lat: 42.35700999905103,
      lng: -71.05761000345488,
    });
    expect(inputWrapper.getDOMNode().value).toEqual('');
  });

  it('preserves query on failure', async () => {
    wrapper.find('form').simulate('submit');
    expect(searchAddress).toHaveBeenCalledWith(ACTIONS.loopbackGraphql, '121 devonshire');

    await resolveGraphql(null);

    expect(requestForm.address).toEqual('');
    expect(requestForm.location).toEqual(null);
    expect(inputWrapper.getDOMNode().value).toEqual('121 devonshire');
  });
});
