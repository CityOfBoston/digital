import React from 'react';
import { storiesOf } from '@storybook/react';

import PasswordPolicy from './PasswordPolicy';

storiesOf('PasswordPolicy', module)
  .add('blank', () => <PasswordPolicy password="" />)
  .add('long enough', () => <PasswordPolicy password="1234567890" />)
  .add('complex enough', () => <PasswordPolicy password="A2#" />)
  .add('spaces error', () => <PasswordPolicy password="a b" />)
  .add('failed are errors', () => (
    <PasswordPolicy password="b" showFailedAsErrors />
  ));
