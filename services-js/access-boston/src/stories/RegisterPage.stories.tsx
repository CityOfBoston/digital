import React from 'react';
import { storiesOf } from '@storybook/react';

import RegisterPage from '../pages/register';

storiesOf('RegisterPage', module)
  .add('default', () => (
    <RegisterPage
      account={{
        employeeId: 'CON01234',
        registered: false,
        needsMfaDevice: true,
        needsNewPassword: true,
        resetPasswordToken: '',
      }}
    />
  ))
  .add('password already ok', () => (
    <RegisterPage
      account={{
        employeeId: 'CON01234',
        registered: false,
        needsMfaDevice: true,
        needsNewPassword: false,
        resetPasswordToken: '',
      }}
    />
  ));
