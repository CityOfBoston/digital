// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';

import { YELLOW } from '../style-constants';
import type { SearchRequest } from '../../data/types';

import RequestPopup from './RequestPopup';

const NO_IMAGE_REQUEST: SearchRequest = {
  service: {
    name: 'Trash Pick Up',
  },
  id: '17-0000001',
  address: '1 City Hall Plaza, Boston, MA',
  description: 'Thanos has fallen out of the sky onto the ground.',
  location: null,
  mediaUrl: null,
  status: 'open',
  updatedAtRelativeString: '2 days ago',
  updatedAt: 0,
};

const IMAGE_REQUEST: SearchRequest = {
  ...NO_IMAGE_REQUEST,
  mediaUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
};

storiesOf('RequestPopup', module)
  .addDecorator((next) => (
    <div style={{ width: 300, border: `2px solid ${YELLOW}` }}>{next()}</div>
  ))
  .add('image', () => (
    <RequestPopup request={IMAGE_REQUEST} />
  ))
  .add('no image', () => (
    <RequestPopup request={NO_IMAGE_REQUEST} />
  ));
