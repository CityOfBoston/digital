import React from 'react';
import { storiesOf } from '@storybook/react';

import RegisterPage from '../pages/register';

storiesOf('RegisterPage', module).add('needs password and MFA', () => (
  <RegisterPage
    account={{
      employeeId: 'CON01234',
      registered: false,
      needsMfaDevice: true,
      needsNewPassword: true,
    }}
  />
));
