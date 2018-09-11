import React from 'react';
import { storiesOf } from '@storybook/react';

import ForgotPasswordPage from '../pages/forgot';

storiesOf('ForgotPasswordPage', module).add('default', () => (
  <ForgotPasswordPage serverErrors={{}} />
));
