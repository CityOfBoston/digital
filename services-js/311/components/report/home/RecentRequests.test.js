// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import { AppStore } from '../../../data/store';
import type { SearchRequest } from '../../../data/types';

import RecentRequests from './RecentRequests';

export const MOCK_REQUEST: SearchRequest = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
  },
  description: 'I think that Thanos is here',
  status: 'open',
  address: 'City Hall Plaza, Boston, MA 02131',
  location: {
    lat: 4,
    lng: 5,
  },
  updatedAtRelativeString: '4 minutes ago',
  mediaUrl: null,
};

describe('rendering', () => {
  let store;

  beforeEach(() => {
    store = new AppStore();
    store.requestSearch.results = [MOCK_REQUEST];
  });

  test('results loaded', () => {
    const component = renderer.create(
      <RecentRequests store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('with request selected', () => {
    store.requestSearch.selectedRequest = MOCK_REQUEST;

    const component = renderer.create(
      <RecentRequests store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

test('searching', () => {
  const store = new AppStore();

  const wrapper = mount(
    <RecentRequests store={store} loadRequests={false} />,
  );

  const inputWrapper = wrapper.find('input[type="text"]').first();
  inputWrapper.simulate('input', { target: { value: 'Mewnir' } });
  expect(inputWrapper.getDOMNode().value).toEqual('Mewnir');

  wrapper.find('form').simulate('submit');
  expect(store.requestSearch.query).toEqual('Mewnir');
});
