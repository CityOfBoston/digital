import React from 'react';
import { storiesOf } from '@storybook/react';

import AccessBostonHeader from './AccessBostonHeader';

import { InfoResponse } from '../lib/api';

const INFO: InfoResponse = {
  employeeId: 'CON01234',
  requestAccessUrl: '#',
  categories: [],
};

storiesOf('AccessBostonHeader', module).add('default', () => (
  <AccessBostonHeader info={INFO} />
));
