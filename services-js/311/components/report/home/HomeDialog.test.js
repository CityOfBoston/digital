// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../../data/store';
import HomeDialog from './HomeDialog';

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
    store.description = 'Thanos is attacking.';
    store.serviceSummaries = SERVICE_SUMMARIES;
  });

  test('home screen', () => {
    const component = renderer.create(
      <HomeDialog store={store} routeToServiceForm={jest.fn()} stage="home" />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  test('small screen service picker', () => {
    const component = renderer.create(
      <HomeDialog store={store} routeToServiceForm={jest.fn()} stage="service" />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
