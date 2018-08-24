import React from 'react';
import { storiesOf } from '@storybook/react';

import IndexPage, { FlashMessage } from '../pages/index';
import { Account, Apps } from '../client/graphql/fetch-account-and-apps';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
};

const APPS: Apps = {
  categories: [
    {
      title: 'Employee Tools',
      requestAccessUrl: '#',
      showIcons: false,
      apps: [
        {
          title: 'The Hub',
          url: '#',
          iconUrl: null,
          description:
            'Employee directory and other information for employees.',
        },
        {
          title: 'Building Maintenance Form',
          url: '#',
          iconUrl: null,
          description: 'Report a maintenance problem with a City building.',
        },
        {
          title: 'ESS',
          url: '#',
          iconUrl: null,
          description: '',
        },
        {
          title: 'Employee Connect',
          url: '#',
          iconUrl: null,
          description: '',
        },
        {
          title: 'My Learning Plan',
          url: '#',
          iconUrl: null,
          description: '',
        },
      ],
    },
    {
      title: 'Financial Software',
      requestAccessUrl: null,
      showIcons: true,
      apps: [
        {
          title: 'BAIS FN',
          url: '#',
          iconUrl: null,
          description: '',
        },
        {
          title: 'BAIS HCM',
          url: '#',
          iconUrl: null,
          description: '',
        },
      ],
    },
  ],
};

storiesOf('IndexPage', module)
  .add('default', () => <IndexPage account={ACCOUNT} apps={APPS} />)
  .add('change password success', () => (
    <IndexPage
      account={ACCOUNT}
      apps={APPS}
      flashMessage={FlashMessage.CHANGE_PASSWORD_SUCCESS}
    />
  ));
