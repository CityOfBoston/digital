import React from 'react';
import { storiesOf } from '@storybook/react';

import { Account } from '../graphql/fetch-account';
import AppWrapper from './AppWrapper';

const ACCOUNT: Account = {
  employeeId: 'CON01234',
  firstName: 'Jyn',
  lastName: 'Doe',
  needsMfaDevice: false,
  needsNewPassword: false,
  hasMfaDevice: false,
  resetPasswordToken: '',
  mfaRequiredDate: null,
};

storiesOf('Common components/AppWrapper', module)
  .add('default', () => <AppWrapper account={ACCOUNT}>&nbsp;</AppWrapper>)
  .add('without interactive header', () => <AppWrapper>&nbsp;</AppWrapper>);
