// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';

import RecentRequests from './RecentRequests';
import { AppStore } from '../../data/store';
import type { SearchCase } from '../../data/types';

export const MOCK_CASES: SearchCase[] = [
  {
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
    images: [
      {
        squareThumbnailUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
      },
    ],
  },
  {
    id: '17-000000002',
    service: {
      name: 'Travesties',
    },
    description:
      'Patsy Walker got cancelled. It was a really good book with interesting, diverse characters and a light-hearted sense of humor.',
    status: 'closed',
    address: 'City Hall Plaza, Boston, MA 02131',
    location: {
      lat: 4,
      lng: 5,
    },
    requestedAt: 1490804343,
    requestedAtRelativeString: '8 months ago',
    images: [],
  },
];

const makeStore = (
  cases: ?(SearchCase[]),
  selectedIndex: number,
  opts: ?Object
) => {
  const store = new AppStore();
  const { requestSearch } = store;

  if (cases) {
    requestSearch.updateCaseSearchResults({ cases, query: '' });
    requestSearch.selectedRequest = cases[selectedIndex];
  }

  if (opts) {
    Object.assign(requestSearch, opts);
  }

  return store;
};

storiesOf('RecentRequests', module)
  .add('loading without results', () =>
    <RecentRequests store={makeStore(null, 0, { loading: true })} />
  )
  .add('no results (no query)', () =>
    <RecentRequests store={makeStore([], 0)} />
  )
  .add('no results (query)', () =>
    <RecentRequests
      store={makeStore([], 0, {
        query: 'borken sidewalk',
        resultsQuery: 'borken sidewalk',
      })}
    />
  )
  .add('results loaded', () =>
    <RecentRequests store={makeStore(MOCK_CASES, -1)} />
  )
  .add('results loaded and loading more', () =>
    <RecentRequests store={makeStore(MOCK_CASES, -1, { loading: true })} />
  )
  .add('with selection', () =>
    <RecentRequests store={makeStore(MOCK_CASES, 1)} />
  )
  .add('no dates', () =>
    <RecentRequests
      store={makeStore(
        (MOCK_CASES.map(c => ({
          ...c,
          requestedAt: null,
          requestedAtRelativeString: null,
        })): any),
        1
      )}
    />
  )
  .add('with error', () =>
    <RecentRequests
      store={makeStore([], -1, {
        resultsError: new Error('EVERYTHING IS BROKEN'),
      })}
    />
  );
