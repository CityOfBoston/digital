import React from 'react';
import { storiesOf } from '@storybook/react';

import ChangePasswordPage from '../pages/change-password';
import { Account } from '../client/graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  firstName: 'Jyn',
  lastName: 'Doe',
  needsMfaDevice: false,
  needsNewPassword: false,
  hasMfaDevice: true,
  resetPasswordToken: '',
  mfaRequiredDate: null,
  groups: [''],
  email: 'jondoe@boston.gov',
};

storiesOf('ChangePasswordPage', module)
  .add('default', () => (
    <ChangePasswordPage account={ACCOUNT} fetchGraphql={null as any} />
  ))
  .add('first time registration', () => (
    <ChangePasswordPage
      account={{ ...ACCOUNT, needsNewPassword: true }}
      fetchGraphql={null as any}
    />
  ))
  .add('first time registration w/ temp password', () => (
    <ChangePasswordPage
      account={{ ...ACCOUNT, needsNewPassword: true }}
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
  ))
  .add('network error', () => (
    <ChangePasswordPage
      account={ACCOUNT}
      fetchGraphql={null as any}
      testSubmittingModal
      testModalError="NETWORK"
    />
  ))
  .add('session error', () => (
    <ChangePasswordPage
      account={ACCOUNT}
      fetchGraphql={null as any}
      testSubmittingModal
      testModalError="SESSION"
    />
  ));
