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
    <ChangePasswordPage account={ACCOUNT} fetchGraphql={null as any} />
  ))
  .add('first time registration', () => (
    <ChangePasswordPage
      account={{ ...ACCOUNT, registered: false, needsNewPassword: true }}
      fetchGraphql={null as any}
    />
  ))
  .add('first time registration w/ temp password', () => (
    <ChangePasswordPage
      account={{ ...ACCOUNT, registered: false, needsNewPassword: true }}
      fetchGraphql={null as any}
      hasTemporaryPassword
    />
  ))

  .add('submitting', () => (
    <ChangePasswordPage
      account={ACCOUNT}
      fetchGraphql={null as any}
      testSubmittingModal
    />
  ));
