import React from 'react';
import { storiesOf } from '@storybook/react';

import TextInput, { renderErrorNextToInput } from './TextInput';

storiesOf('TextInput', module).add('variants', () => (
  <>
    <TextInput label="Normal Input" />
    <TextInput
      label="Normal Input with Info"
      info="This field is important to get right"
    />
    <TextInput label="Required Input" required />
    <TextInput label="Password" type="password" value="password" />
    <TextInput label="String error" error="Value is not correct" />
    <TextInput label="Boolean error" error />
    <TextInput
      label="Error next to input"
      error="Error is over here"
      info="We sent you this in a card in the mail"
      hideErrorMessage
      renderInputFunc={renderErrorNextToInput}
    />
  </>
));
