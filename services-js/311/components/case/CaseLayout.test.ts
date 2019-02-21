import { makeServerContext } from '../../lib/test/make-context';

import CaseLayout from './CaseLayout';
import { Request } from '../../data/types';

jest.mock('next/router');
jest.mock('../../data/queries/load-case');

import loadCase from '../../data/queries/load-case';
const loadCaseMock: jest.MockInstance<
  ReturnType<typeof loadCase>,
  Parameters<typeof loadCase>
> = loadCase as any;

const MOCK_REQUEST: Request = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
    code: 'CSMCINC',
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
  expectedAtString: null,
  serviceNotice: null,
};

describe('case', () => {
  let data;

  beforeEach(async () => {
    loadCaseMock.mockReturnValue(Promise.resolve(MOCK_REQUEST));
    const ctx = makeServerContext('/reports', { id: 'case-id' });
    data = (await CaseLayout.getInitialProps(ctx, { fetchGraphql: jest.fn() }))
      .data;
  });

  test('getInitialProps', () => {
    expect(data).toBeDefined();
  });
});

describe('case not found', () => {
  let ctx;

  beforeEach(async () => {
    loadCaseMock.mockReturnValue(Promise.resolve(null));
    ctx = makeServerContext('/reports', { id: 'not-a-real-id' });
    await CaseLayout.getInitialProps(ctx, { fetchGraphql: jest.fn() });
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
