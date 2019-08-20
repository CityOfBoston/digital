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
  groups: [''],
  email: '',
};

storiesOf('Common/AppWrapper', module).add('default', () => (
  <AppWrapper account={ACCOUNT}>hi</AppWrapper>
));
