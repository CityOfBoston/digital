import React from 'react';
import { storiesOf } from '@storybook/react';

import ChangePasswordPage from '../pages/change-password';
import { Account } from '../client/graphql/fetch-account';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
};

storiesOf('ChangePasswordPage', module)
  .add('default', () => (
    <ChangePasswordPage
      account={ACCOUNT}
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
