import React from 'react';
import { storiesOf } from '@storybook/react';
import inPercy from '@percy-io/in-percy';

import { Request } from '../../data/types';
import CaseView from './CaseView';

const IMAGE_1 = {
  tags: ['Create'],
  originalUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
  squarePreviewUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/t_large_square_preview/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
};

const IMAGE_2 = {
  tags: ['Create'],
  originalUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/v1493747308/boston/dev/rjnbye1orlk03jouoi6n.jpg',
  squarePreviewUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/t_large_square_preview/v1493747308/boston/dev/rjnbye1orlk03jouoi6n.jpg',
};

const IMAGE_3 = {
  tags: [],
  originalUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/v1503597032/boston/dev/jp1zszxom2nfp5qiump7.jpg',
  squarePreviewUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/t_large_square_preview/v1503597032/boston/dev/jp1zszxom2nfp5qiump7.jpg',
};

const IMAGE_4 = {
  tags: [],
  originalUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/v1494436509/boston/dev/p4d2rpz0dihxglkkixgq.jpg',
  squarePreviewUrl:
    'https://res.cloudinary.com/spot-boston/image/upload/t_large_square_preview/v1494436509/boston/dev/p4d2rpz0dihxglkkixgq.jpg',
};

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
  serviceNotice: null,
  location: {
    lat: 42.359927299999995,
    lng: -71.0576853,
  },
  images: [IMAGE_1],
  address: 'City Hall Plaza, Boston, MA 02131',
  requestedAtString: 'March 7, 2017, 12:59 PM',
  updatedAtString: 'April 8, 2017, 12:59 PM',
  expectedAtString: 'Thursday, May 9, 2017',
};

const suppressMap = inPercy() || process.env.NODE_ENV === 'test';

storiesOf('CaseView', module)
  .addDecorator(next => (
    <div style={{ width: '100%', background: 'white' }}>
      <div className="b-c">{next()}</div>
    </div>
  ))
  .add('Submitted', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, status: 'open' }}
        submitted
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Submitted with Service Notice', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          status: 'open',
          serviceNotice:
            'The Ultimates respond to cases in the order that they’re received. When your scheduled date arrives, expect a star-shaped portal to appear and help to arrive through it.',
        }}
        submitted
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Submitted with Service Notice and schedule', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          service: {
            ...MOCK_REQUEST.service,
            code: 'SCHDBLKITM',
          },
          status: 'open',
          serviceNotice:
            'The Ultimates respond to cases in the order that they’re received. When your scheduled date arrives, expect a star-shaped portal to appear and help to arrive through it.',
        }}
        submitted
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - No info', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [],
          location: null,
          status: 'open',
        }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - No Date', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          status: 'open',
          requestedAtString: null,
        }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - Just location', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, images: [], status: 'open' }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - 1 Image', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, images: [IMAGE_1], status: 'open' }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - 2 images', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [IMAGE_1, IMAGE_2],
          status: 'open',
        }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - 3 images', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [IMAGE_1, IMAGE_2, IMAGE_3],
          status: 'open',
        }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - 4 images', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          images: [IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_4],
          status: 'open',
        }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - Service Notice', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          status: 'open',
          serviceNotice:
            'The Ultimates respond to cases in the order that they’re received. When your scheduled date arrives, expect a star-shaped portal to appear and help to arrive through it.',
        }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Open - Scheduled Service Notice', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{
          ...MOCK_REQUEST,
          service: {
            ...MOCK_REQUEST.service,
            code: 'SCHDBLKITM',
          },
          status: 'open',
          serviceNotice:
            'The Ultimates respond to cases in the order that they’re received. When your scheduled date arrives, expect a star-shaped portal to appear and help to arrive through it.',
        }}
        noMap={suppressMap}
      />
    </div>
  ))
  .add('Resolved', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView request={MOCK_REQUEST} noMap={suppressMap} />
    </div>
  ))
  .add('Closed without reasons', () => (
    <div style={{ backgroundColor: 'white' }}>
      <CaseView
        request={{ ...MOCK_REQUEST, closureReason: null, closureComment: null }}
        noMap={suppressMap}
      />
    </div>
  ));
