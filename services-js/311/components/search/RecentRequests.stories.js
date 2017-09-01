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

const makeStore = (selected: boolean) => {
  const store = new AppStore();
  store.requestSearch.updateCaseSearchResults({ cases: MOCK_CASES, query: '' });

  if (selected) {
    store.requestSearch.selectedRequest = MOCK_CASES[1];
  }

  return store;
};

storiesOf('RecentRequests', module)
  .addDecorator(story =>
    <div>
      {story()}
    </div>
  )
  .add('results loaded', () => <RecentRequests store={makeStore(false)} />)
  .add('with selection', () => <RecentRequests store={makeStore(true)} />);
