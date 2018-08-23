import React from 'react';
import { storiesOf } from '@storybook/react';

import TextInput from './TextInput';

storiesOf('TextInput', module).add('variants', () => (
  <>
    <TextInput label="Normal Input" />
    <TextInput label="Required Input" required />
    <TextInput label="Password" type="password" value="password" />
    <TextInput label="String error" error="Value is not correct" />
    <TextInput label="Boolean error" error />
  </>
));
