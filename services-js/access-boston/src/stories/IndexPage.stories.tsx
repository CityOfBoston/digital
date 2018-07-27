import React from 'react';
import { storiesOf } from '@storybook/react';

import IndexPage from '../pages/index';
import { InfoResponse } from '../lib/api';

const INFO: InfoResponse = {
  employeeId: 'CON01234',
  accountTools: [
    {
      name: 'Change password',
      url: '#',
    },
    {
      name: 'Manage device',
      url: '#',
    },
  ],
};

storiesOf('IndexPage', module).add('default', () => <IndexPage info={INFO} />);
