import React from 'react';
import { storiesOf } from '@storybook/react';

import { YELLOW } from '@cityofboston/react-fleet';

import { SearchCase } from '../../data/types';

import RequestPopup from './RequestPopup';

const NO_IMAGE_REQUEST: SearchCase = {
  service: {
    name: 'Trash Pick Up',
  },
  id: '17-0000001',
  address: '1 City Hall Plaza, Boston, MA',
  description: 'Thanos has fallen out of the sky onto the ground.',
  location: null,
  images: [],
  status: 'open',
  requestedAtRelativeString: '2 days ago',
  requestedAt: 0,
};

const IMAGE_REQUEST = Object.assign({}, NO_IMAGE_REQUEST);
IMAGE_REQUEST.images = [
  {
    squareThumbnailUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
  },
];

storiesOf('RequestPopup', module)
  .addDecorator(next => (
    <div style={{ float: 'left', border: `2px solid ${YELLOW}` }}>{next()}</div>
  ))
  .add('image', () => <RequestPopup caseInfo={IMAGE_REQUEST} />)
  .add('no image', () => <RequestPopup caseInfo={NO_IMAGE_REQUEST} />);
