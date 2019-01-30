import React from 'react';
import { storiesOf } from '@storybook/react';

import IndexPage, { FlashMessage } from '../pages/index';
import { Account, Apps } from '../client/graphql/fetch-account-and-apps';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  registered: true,
  needsMfaDevice: false,
  needsNewPassword: false,
  resetPasswordToken: '',
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
          newWindow: false,
        },
        {
          title: 'Building Maintenance Form',
          url: '#',
          iconUrl: null,
          description: 'Report a maintenance problem with a City building.',
          newWindow: true,
        },
        {
          title: 'ESS',
          url: '#',
          iconUrl: null,
          description: '',
          newWindow: false,
        },
        {
          title: 'Employee Connect',
          url: '#',
          iconUrl: null,
          description: '',
          newWindow: false,
        },
        {
          title: 'My Learning Plan',
          url: '#',
          iconUrl: null,
          description: '',
          newWindow: false,
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
          newWindow: false,
        },
        {
          title: 'BAIS HCM',
          url: '#',
          iconUrl: null,
          description: '',
          newWindow: false,
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
