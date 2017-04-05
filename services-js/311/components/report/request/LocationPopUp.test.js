// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';
import { runInAction } from 'mobx';

import { AppStore } from '../../../data/store';
import type { SearchAddressPlace, ReverseGeocodedPlace } from '../../../data/types';
import LocationPopUp from './LocationPopUp';

jest.mock('../../../data/dao/search-address');
jest.mock('../../../data/dao/reverse-geocode');
const searchAddress: JestMockFn = (require('../../../data/dao/search-address'): any).default;
const reverseGeocode: JestMockFn = (require('../../../data/dao/reverse-geocode'): any).default;

const ACTIONS = {
  loopbackGraphql: jest.fn(),
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

  it('renders a map on a small screen', () => {
    store.ui.visibleWidth = 320;
    const component = renderer.create(
      <LocationPopUp store={store} {...ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('searching', () => {
  let store;
  let resolveGraphql: (place: ?SearchAddressPlace) => void;
  let wrapper;
  let inputWrapper;

  beforeEach(() => {
    const promise = new Promise((resolve) => {
      resolveGraphql = resolve;
    });

    searchAddress.mockReturnValue(promise);

    store = new AppStore();
    store.requestForm.locationInfo.address = 'Red Barn';
    store.requestForm.locationInfo.location = {
      lat: 42.360071,
      lng: -71.056413,
    };

    wrapper = mount(
      <LocationPopUp store={store} {...ACTIONS} />,
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

    const { requestForm: { locationInfo } } = store;
    expect(locationInfo.address).toEqual('121 Devonshire Street, Boston, MA, 02108');
    expect(locationInfo.location).toEqual({
      lat: 42.35700999905103,
      lng: -71.05761000345488,
    });
    expect(inputWrapper.getDOMNode().value).toEqual('');
  });

  it('preserves query on failure', async () => {
    wrapper.find('form').simulate('submit');
    expect(searchAddress).toHaveBeenCalledWith(ACTIONS.loopbackGraphql, '121 devonshire');

    await resolveGraphql(null);

    const { requestForm: { locationInfo } } = store;
    expect(locationInfo.address).toEqual('');
    expect(locationInfo.location).toEqual(null);
    expect(inputWrapper.getDOMNode().value).toEqual('121 devonshire');
  });
});

describe('reverse geocoding', () => {
  let store;
  let wrapper;
  let resolveGraphql: (place: ?ReverseGeocodedPlace) => void;

  beforeEach(() => {
    store = new AppStore();

    wrapper = shallow(
      <LocationPopUp store={store} {...ACTIONS} />,
    );

    reverseGeocode.mockReturnValue(new Promise((resolve) => {
      resolveGraphql = resolve;
    }));
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('runs reverse geocoder when lat/lng changes', async () => {
    const { locationInfo } = store.requestForm;

    runInAction(() => {
      locationInfo.location = { lat: 45, lng: 50 };
      locationInfo.address = '';
    });

    expect(reverseGeocode).toHaveBeenCalledWith(ACTIONS.loopbackGraphql, { lat: 45, lng: 50 });

    await resolveGraphql({
      address: '121 Devonshire St.',
      location: {
        lat: 42.35700999905103,
        lng: -71.05761000345488,
      },
    });

    expect(locationInfo.address).toEqual('121 Devonshire St.');
    // location is not updated from reverse geocode to preserve user's input
    expect(locationInfo.location).toEqual({ lat: 45, lng: 50 });
  });

  it('leaves address blank if the geocode doesn’t return anything', async () => {
    const { locationInfo } = store.requestForm;

    runInAction(() => {
      locationInfo.location = { lat: 45, lng: 50 };
      locationInfo.address = '';
    });

    await resolveGraphql(null);

    expect(locationInfo.address).toEqual('');
    expect(locationInfo.location).toEqual({ lat: 45, lng: 50 });
  });

  it('doesn’t reverse geocode if an address is set at the same time', () => {
    const { locationInfo } = store.requestForm;

    runInAction(() => {
      locationInfo.location = { lat: 45, lng: 50 };
      locationInfo.address = '121 Devonshire St.';
    });

    expect(reverseGeocode).not.toHaveBeenCalled();
  });
});
