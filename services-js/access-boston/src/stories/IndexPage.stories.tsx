import React from 'react';
import { storiesOf } from '@storybook/react';

import IndexPage from '../pages/index';
import { InfoResponse } from '../lib/api';

const INFO: InfoResponse = {
  employeeId: 'CON01234',
  requestAccessUrl: '#',
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
  categories: [
    {
      title: 'Employee Tools',
      apps: [
        {
          title: 'The Hub',
          url: '#',
          description:
            'Employee directory and other information for employees.',
        },
        {
          title: 'Building Maintenance Form',
          url: '#',
          description: 'Report a maintenance problem with a City building.',
        },
        {
          title: 'ESS',
          url: '#',
          description: '',
        },
        {
          title: 'Employee Connect',
          url: '#',
          description: '',
        },
        {
          title: 'My Learning Plan',
          url: '#',
          description: '',
        },
      ],
    },
    {
      title: 'Financial Software',
      apps: [
        {
          title: 'BAIS FN',
          url: '#',
          description: '',
        },
        {
          title: 'BAIS HCM',
          url: '#',
          description: '',
        },
      ],
    },
  ],
};

storiesOf('IndexPage', module).add('default', () => <IndexPage info={INFO} />);
