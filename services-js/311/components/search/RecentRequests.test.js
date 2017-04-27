// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../data/store';
import type { SearchRequest } from '../../data/types';

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
  updatedAt: 1490804343,
  updatedAtRelativeString: '4 minutes ago',
  mediaUrl: null,
};

describe('rendering', () => {
  let store;

  beforeEach(() => {
    store = new AppStore();
    store.requestSearch.updateRequestSearchResults({ requests: [MOCK_REQUEST], query: '' });
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
