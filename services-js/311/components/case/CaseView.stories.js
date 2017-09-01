// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import inPercy from '@percy-io/in-percy';

import type { Request } from '../../data/types';
import { AppStore } from '../../data/store';
import CaseView from './CaseView';

const IMAGE_1 = {
  tags: ['Create'],
  originalUrl:
    'http://boston.spot.show/image/upload/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
  squarePreviewUrl:
    'http://boston.spot.show/image/upload/t_large_square_preview/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
};

const IMAGE_2 = {
  tags: ['Create'],
  originalUrl:
    'http://boston.spot.show/image/upload/v1493747308/boston/dev/rjnbye1orlk03jouoi6n.jpg',
  squarePreviewUrl:
    'http://boston.spot.show/image/upload/t_large_square_preview/v1493747308/boston/dev/rjnbye1orlk03jouoi6n.jpg',
};

const IMAGE_3 = {
  tags: [],
  originalUrl:
    'http://boston.spot.show/image/upload/v1503597032/boston/dev/jp1zszxom2nfp5qiump7.jpg',
  squarePreviewUrl:
    'http://boston.spot.show/image/upload/t_large_square_preview/v1503597032/boston/dev/jp1zszxom2nfp5qiump7.jpg',
};

const IMAGE_4 = {
  tags: [],
  originalUrl:
    'http://boston.spot.show/image/upload/v1494436509/boston/dev/p4d2rpz0dihxglkkixgq.jpg',
  squarePreviewUrl:
    'http://boston.spot.show/image/upload/t_large_square_preview/v1494436509/boston/dev/p4d2rpz0dihxglkkixgq.jpg',
};

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
  images: [IMAGE_1],
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
    <div style={{ width: '100%', background: 'white' }}>
      <div className="b-c">
        {next()}
      </div>
    </div>
  )
  .add('Submitted', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, status: 'open' }}
        store={makeStore()}
        submitted
        noMap={suppressMap}
      />
    </div>
  )
  .add('Open - No info', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [],
          location: null,
          status: 'open',
        }}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>
  )
  .add('Open - Just location', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, images: [], status: 'open' }}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>
  )
  .add('Open - 1 Image', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, images: [IMAGE_1], status: 'open' }}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>
  )
  .add('Open - 2 images', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [IMAGE_1, IMAGE_2],
          status: 'open',
        }}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>
  )
  .add('Open - 3 images', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [IMAGE_1, IMAGE_2, IMAGE_3],
          status: 'open',
        }}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>
  )
  .add('Open - 4 images', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_4],
          status: 'open',
        }}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>
  )
  .add('Resolved', () =>
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={MOCK_REQUEST}
        store={makeStore()}
        noMap={suppressMap}
      />
    </div>
  );
