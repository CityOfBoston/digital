// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import inPercy from '@percy-io/in-percy';

import type { Request } from '../../data/types';
import { AppStore } from '../../data/store';
import CaseView from './CaseView';

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

const suppressMap = inPercy() || process.env.NODE_ENV === 'test';

storiesOf('CaseView', module)
  .addDecorator(next =>
    <div className="b-c" style={{ background: 'white' }}>{next()}</div>,
  )
  .add('Submitted', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, status: 'open' }}
        store={makeStore()}
        submitted
        noMap={suppressMap}
      />
    </div>,
  )
  .add('Open', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, status: 'open' }}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>,
  )
  .add('Resolved', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={MOCK_REQUEST}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>,
  );
