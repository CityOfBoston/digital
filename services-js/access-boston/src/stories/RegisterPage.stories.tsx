import React from 'react';
import { storiesOf } from '@storybook/react';

import RegisterPage from '../pages/register';

storiesOf('RegisterPage', module)
  .add('default', () => (
    <RegisterPage
      account={{
        employeeId: 'CON01234',
        firstName: 'Jyn',
        lastName: 'Doe',
        needsMfaDevice: true,
        needsNewPassword: true,
        hasMfaDevice: false,
        resetPasswordToken: '',
        mfaRequiredDate: null,
        groups: [''],
        email: 'jondoe@boston.gov',
      }}
    />
  ))
  .add('password already ok', () => (
    <RegisterPage
      account={{
        employeeId: 'CON01234',
        firstName: 'Jyn',
        lastName: 'Doe',
        needsMfaDevice: true,
        needsNewPassword: false,
        hasMfaDevice: false,
        resetPasswordToken: '',
        mfaRequiredDate: null,
        groups: [''],
        email: 'jondoe@boston.gov',
      }}
    />
  ));
