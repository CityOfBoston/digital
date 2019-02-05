import React from 'react';
import { storiesOf } from '@storybook/react';

import ForgotPasswordPage from '../pages/forgot';
import { Account } from '../client/graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  firstName: 'Jyn',
  lastName: 'Doe',
  registered: true,
  needsMfaDevice: false,
  needsNewPassword: false,
  resetPasswordToken: 'jfqWE7DExC4nUa7pvkABezkM4oNT',
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
      testNetworkError
    />
  ));
