import React from 'react';
import { storiesOf } from '@storybook/react';

import RegisterMfaPage from '../pages/mfa';
import { Account } from '../client/graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  registered: true,
  needsMfaDevice: false,
  needsNewPassword: false,
};

storiesOf('RegisterMfaPage', module)
  .add('form', () => (
    <RegisterMfaPage account={ACCOUNT} fetchGraphql={null as any} />
  ))
  .add('modal', () => (
    <RegisterMfaPage
      account={ACCOUNT}
      fetchGraphql={null as any}
      testVerificationCodeModal
    />
  ));
