import React from 'react';
import { storiesOf } from '@storybook/react';

import ChangePasswordPage from '../pages/change-password';
import { Account } from '../client/graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  registered: true,
  needsMfaDevice: false,
  needsNewPassword: false,
};

storiesOf('ChangePasswordPage', module)
  .add('default', () => (
    <ChangePasswordPage
      account={ACCOUNT}
      serverErrors={{}}
      fetchGraphql={null as any}
    />
  ))
  .add('first time registration', () => (
    <ChangePasswordPage
      account={{ ...ACCOUNT, registered: false, needsNewPassword: true }}
      serverErrors={{}}
      fetchGraphql={null as any}
    />
  ))

  .add('submitting', () => (
    <ChangePasswordPage
      account={ACCOUNT}
      serverErrors={{}}
      fetchGraphql={null as any}
      testSubmittingModal
    />
  ))
  .add('server errors', () => (
    <ChangePasswordPage
      account={ACCOUNT}
      serverErrors={{ password: 'Current password is incorrect' }}
      fetchGraphql={null as any}
    />
  ));
