import React from 'react';
import { storiesOf } from '@storybook/react';

import ChangePasswordPage from '../pages/change-password';
import { InfoResponse } from '../lib/api';

const INFO: InfoResponse = {
  employeeId: 'CON01234',
  requestAccessUrl: '#',
  categories: [],
};

storiesOf('ChangePasswordPage', module).add('default', () => (
  <ChangePasswordPage info={INFO} />
));
