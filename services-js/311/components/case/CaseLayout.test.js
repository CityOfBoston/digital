// @flow
/* eslint no-fallthrough: 0 */

import type { Request } from '../../data/types';
import { AppStore } from '../../data/store';
import { makeServerContext } from '../../lib/test/make-context';

import CaseLayout from './CaseLayout';

jest.mock('next/router');
jest.mock('../../data/dao/load-case');

const loadCase: JestMockFn = (require('../../data/dao/load-case'): any).default;

const MOCK_API_KEYS = {
  mapbox: {
    accessToken: 'fake-access-token',
    stylePath: 'fake-style-path',
  },
};

const MOCK_REQUEST: Request = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
  },
  description: 'I think that Thanos is here',
  status: 'closed',
  closureReason: 'Case Resolved',
  closureComment:
    'Found Thanos. Smashed him into the floor with all of us standing around.',
  location: {
    lat: 42.359927299999995,
    lng: -71.0576853,
  },
  images: [
    {
      tags: [],
      originalUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
      squarePreviewUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
    },
  ],
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

    loadCase.mockReturnValue(Promise.resolve(MOCK_REQUEST));
    const ctx = makeServerContext('/reports', { id: 'case-id' });
    data = (await CaseLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    expect(data).toBeDefined();
  });
});

describe('case not found', () => {
  let ctx;

  beforeEach(async () => {
    loadCase.mockReturnValue(Promise.resolve(null));
    ctx = makeServerContext('/reports', { id: 'not-a-real-id' });
    await CaseLayout.getInitialProps(ctx);
  });

  test('getInitialProps', () => {
    // flow check
    if (ctx.res) {
      expect(ctx.res.statusCode).toEqual(404);
    } else {
      expect(ctx.res).toBeDefined();
    }
  });
});
