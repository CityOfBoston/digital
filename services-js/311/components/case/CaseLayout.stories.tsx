import React from 'react';
import { storiesOf } from '@storybook/react';

import page from '../../.storybook/page';
import { Request } from '../../data/types';
import CaseLayout from './CaseLayout';

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
  location: null,
  images: [
    {
      tags: [],
      originalUrl:
        'https://res.cloudinary.com/spot-boston/image/upload/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
      squarePreviewUrl:
        'https://res.cloudinary.com/spot-boston/image/upload/t_large_square_preview/v1493819948/boston/dev/ifonxqgpk8gukjkcvj78.jpg',
    },
  ],
  address: 'City Hall Plaza, Boston, MA 02131',
  requestedAtString: 'March 7, 2017, 12:59 PM',
  updatedAtString: 'April 8, 2017, 12:59 PM',
  expectedAtString: null,
  serviceNotice: null,
};

storiesOf('CaseLayout', module)
  .addDecorator(page)
  .add('Existing', () => (
    <CaseLayout
      id={MOCK_REQUEST.id}
      data={{ request: { ...MOCK_REQUEST, status: 'open' } }}
    />
  ))
  .add('404', () => (
    <CaseLayout id={MOCK_REQUEST.id} data={{ request: null }} />
  ));
