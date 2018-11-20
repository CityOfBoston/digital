import React from 'react';
import { storiesOf } from '@storybook/react';

import RecentRequests from './RecentRequests';
import Ui from '../../data/store/Ui';
import { SearchCase } from '../../data/types';
import RequestSearch from '../../data/store/RequestSearch';

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

const makeRequestSearch = (
  cases: (SearchCase[]) | null,
  selectedIndex: number,
  opts?: Partial<RequestSearch>
) => {
  const requestSearch = new RequestSearch();

  if (cases) {
    requestSearch.updateCaseSearchResults({ cases, query: '' });
    requestSearch.selectedRequest = cases[selectedIndex];
  }

  if (opts) {
    Object.assign(requestSearch, opts);
  }

  return requestSearch;
};

storiesOf('RecentRequests', module)
  .add('loading without results', () => (
    <RecentRequests
      ui={new Ui()}
      requestSearch={makeRequestSearch(null, 0, { loading: true })}
    />
  ))
  .add('no results (no query)', () => (
    <RecentRequests ui={new Ui()} requestSearch={makeRequestSearch([], 0)} />
  ))
  .add('no results (query)', () => (
    <RecentRequests
      ui={new Ui()}
      requestSearch={makeRequestSearch([], 0, {
        query: 'borken sidewalk',
        resultsQuery: 'borken sidewalk',
      })}
    />
  ))
  .add('results loaded', () => (
    <RecentRequests
      ui={new Ui()}
      requestSearch={makeRequestSearch(MOCK_CASES, -1)}
    />
  ))
  .add('results loaded and loading more', () => (
    <RecentRequests
      ui={new Ui()}
      requestSearch={makeRequestSearch(MOCK_CASES, -1, { loading: true })}
    />
  ))
  .add('with selection', () => (
    <RecentRequests
      ui={new Ui()}
      requestSearch={makeRequestSearch(MOCK_CASES, 1)}
    />
  ))
  .add('no dates', () => (
    <RecentRequests
      ui={new Ui()}
      requestSearch={makeRequestSearch(
        MOCK_CASES.map(c => ({
          ...c,
          requestedAt: null,
          requestedAtRelativeString: null,
        })) as any,
        1
      )}
    />
  ))
  .add('with error', () => (
    <RecentRequests
      ui={new Ui()}
      requestSearch={makeRequestSearch([], -1, {
        resultsError: new Error('EVERYTHING IS BROKEN'),
      })}
    />
  ));
