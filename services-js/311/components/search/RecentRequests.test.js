// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../data/store';
import type { SearchCase } from '../../data/types';

import RecentRequests from './RecentRequests';

export const MOCK_CASE: SearchCase = {
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
  requestedAt: 1490804343,
  requestedAtRelativeString: '4 minutes ago',
  mediaUrl: null,
};

describe('rendering', () => {
  let store;

  beforeEach(() => {
    store = new AppStore();
    store.requestSearch.updateCaseSearchResults({ cases: [MOCK_CASE], query: '' });
  });

  test('results loaded', () => {
    const component = renderer.create(
      <RecentRequests store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('with request selected', () => {
    store.requestSearch.selectedRequest = MOCK_CASE;

    const component = renderer.create(
      <RecentRequests store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
