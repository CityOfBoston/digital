// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';

import page from '../../storybook/page';
import type { Request } from '../../data/types';
import { AppStore } from '../../data/store';
import CaseLayout from './CaseLayout';

const MOCK_REQUEST: Request = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
  },
  description: 'I think that Thanos is here',
  status: 'closed',
  statusNotes:
    'Found Thanos. Smashed him into the floor with all of us standing around.',
  location: {
    lat: 42.359927299999995,
    lng: -71.0576853,
  },
  mediaUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
  address: 'City Hall Plaza, Boston, MA 02131',
  requestedAtString: 'March 7, 2017, 12:59 PM',
  updatedAtString: 'April 8, 2017, 12:59 PM',
};

function makeStore() {
  const store = new AppStore();
  store.apiKeys = window.API_KEYS;
  return store;
}

storiesOf('CaseLayout', module)
  .addDecorator(page)
  .add('Existing', () =>
    <CaseLayout
      data={{ request: { ...MOCK_REQUEST, status: 'open', location: null } }}
      store={makeStore()}
    />
  )
  .add('404', () =>
    <CaseLayout data={{ request: null }} store={makeStore()} />
  );
