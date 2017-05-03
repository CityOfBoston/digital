// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import renderer from 'react-test-renderer';

import type { Request } from '../../data/types';
import { AppStore } from '../../data/store';
import { makeServerContext } from '../../lib/test/make-context';

import ReportsLayout from './ReportsLayout';

jest.mock('next/router');
jest.mock('../../data/dao/load-request');

const loadRequest: JestMockFn = (require('../../data/dao/load-request'): any).default;

const MOCK_API_KEYS = {
  mapbox: {
    accessToken: 'fake-access-token',
    stylePath: 'fake-style-path',
  },
};

export const MOCK_REQUEST: Request = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
  },
  description: 'I think that Thanos is here',
  status: 'closed',
  statusNotes: 'Found Thanos. Smashed him into the floor with all of us standing around.',
  location: {
    lat: 42.359927299999995,
    lng: -71.0576853,
  },
  mediaUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
  address: 'City Hall Plaza, Boston, MA 02131',
  requestedAtString: 'March 7, 2017, 12:59 PM',
  updatedAtString: 'April 8, 2017, 12:59 PM',
};

describe('case', () => {
  let data;
  let store;

  beforeEach(async () => {
    store = new AppStore();
    store.apiKeys = MOCK_API_KEYS;

    loadRequest.mockReturnValue(Promise.resolve(MOCK_REQUEST));
    const ctx = makeServerContext('/reports', { id: 'case-id' });
    data = (await ReportsLayout.getInitialProps(ctx)).data;
  });

  test('rendering', () => {
    const component = renderer.create(
      <ReportsLayout data={data} store={store} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('case not found', () => {
  let ctx;
  let data;
  let store;

  beforeEach(async () => {
    store = new AppStore();
    store.apiKeys = MOCK_API_KEYS;

    loadRequest.mockReturnValue(Promise.resolve(null));
    ctx = makeServerContext('/reports', { id: 'not-a-real-id' });
    data = (await ReportsLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    // flow check
    if (ctx.res) {
      expect(ctx.res.statusCode).toEqual(404);
    } else {
      expect(ctx.res).toBeDefined();
    }
  });

  test('rendering', () => {
    const component = renderer.create(
      <ReportsLayout data={data} store={store} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
