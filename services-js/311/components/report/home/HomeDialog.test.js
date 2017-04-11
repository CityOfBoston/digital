// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import { AppStore } from '../../../data/store';
import HomeDialog from './HomeDialog';

jest.mock('../../../data/dao/load-service-suggestions');
const loadServiceSuggestions: JestMockFn = (require('../../../data/dao/load-service-suggestions'): any).default;

jest.mock('lodash/debounce');
const debounce: JestMockFn = (require('lodash/debounce'): any);

const SERVICE_SUMMARIES = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: true,
  locationRequired: true,
}];

describe('rendering', () => {
  let store;

  beforeEach(() => {
    store = new AppStore();
    store.requestForm.description = 'Thanos is attacking.';
    store.serviceSummaries = SERVICE_SUMMARIES;

    // mock implementation ignores the function
    debounce.mockImplementation(() => () => {});
  });

  test('home screen', () => {
    const component = renderer.create(
      <HomeDialog store={store} loopbackGraphql={jest.fn()} routeToServiceForm={jest.fn()} stage="home" />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  test('small screen service picker', () => {
    const component = renderer.create(
      <HomeDialog store={store} loopbackGraphql={jest.fn()} routeToServiceForm={jest.fn()} stage="service" />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});

describe('integration', () => {
  let wrapper;
  let store;
  let routeToServiceForm;

  let resolveSuggestions;

  beforeEach(() => {
    // mock implementation always fires, but after a delay
    debounce.mockImplementation((fn) => (...args) => Promise.resolve().then(fn.bind(null, ...args)));

    store = new AppStore();
    store.serviceSummaries = [];

    loadServiceSuggestions.mockReturnValue(new Promise((resolve) => { resolveSuggestions = resolve; }));
    routeToServiceForm = jest.fn();

    wrapper = mount(<HomeDialog store={store} loopbackGraphql={jest.fn()} routeToServiceForm={routeToServiceForm} stage="home" />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('description and suggestions', async () => {
    const descriptionWrapper = wrapper.find('textarea');
    await descriptionWrapper.simulate('input', { target: { value: 'Thanos is attacking' } });

    expect(store.requestForm.description).toEqual('Thanos is attacking');
    expect(loadServiceSuggestions).toHaveBeenCalledWith(expect.anything(), 'Thanos is attacking');

    await resolveSuggestions(SERVICE_SUMMARIES);

    // The service should now appear in the list
    const serviceLink = wrapper.find('a').findWhere((el) => el.text() === 'Cosmic Incursion');
    expect(serviceLink.length).toEqual(1);

    serviceLink.simulate('click');

    expect(routeToServiceForm).toHaveBeenCalledWith('CSMCINC');
  });
});
