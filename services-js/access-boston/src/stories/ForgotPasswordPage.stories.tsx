import React from 'react';
import { storiesOf } from '@storybook/react';

import ForgotPasswordPage from '../pages/forgot';
import { Account } from '../client/graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  firstName: 'Jyn',
  lastName: 'Doe',
  needsMfaDevice: false,
  needsNewPassword: false,
  hasMfaDevice: true,
  resetPasswordToken: 'jfqWE7DExC4nUa7pvkABezkM4oNT',
  mfaRequiredDate: null,
  groups: [''],
  email: 'jondoe@boston.gov',
};

storiesOf('ForgotPasswordPage', module)
  .add('default', () => (
    <ForgotPasswordPage account={ACCOUNT} fetchGraphql={null as any} />
  ))
  .add('success', () => (
    <ForgotPasswordPage
      account={ACCOUNT}
      fetchGraphql={null as any}
      testSuccessMessage
    />
  ))
  .add('network error', () => (
    <ForgotPasswordPage
      account={ACCOUNT}
      fetchGraphql={null as any}
      testSubmittingModal
      testModalError="NETWORK"
    />
  ))
  .add('session error', () => (
    <ForgotPasswordPage
      account={ACCOUNT}
      fetchGraphql={null as any}
      testSubmittingModal
      testModalError="SESSION"
    />
  ));
