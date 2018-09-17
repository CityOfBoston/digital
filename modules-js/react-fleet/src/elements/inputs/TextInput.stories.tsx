import React from 'react';
import { storiesOf } from '@storybook/react';

import TextInput from './TextInput';

storiesOf('Elements/Inputs', module).add('Text Input', () => (
  <>
    <TextInput label="Normal Input" />
    <TextInput label="Required Input" required />
    <TextInput label="Password" type="password" value="password" onChange={() => {}} />
    <TextInput label="String error" error="Value is not correct" />
    <TextInput label="Boolean error" error />

    <TextInput variant="small" label="Small Variant" placeholder="Placeholder Text" />
  </>
));
