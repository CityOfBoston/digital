import React from 'react';
import { storiesOf } from '@storybook/react';

import TextInput from './TextInput';

storiesOf('Form Elements/Inputs', module).add('Text Input', () => (
  <>
    <TextInput label="Normal Input" />

    <TextInput label="Required Input" required />

    <TextInput
      label="Password"
      type="password"
      value="password"
      onChange={() => {}}
    />

    <TextInput label="String error" error="Value is not correct" />

    <TextInput label="Boolean error" error />

    <TextInput
      label={
        <>
          <span style={{ whiteSpace: 'nowrap', marginRight: '0.5em' }}>
            React node passed in as “label”
          </span>
          <wbr />
          <span style={{ fontSize: '80%', whiteSpace: 'nowrap' }}>
            instead of a string
          </span>
        </>
      }
    />

    <TextInput small label="Small Variant" placeholder="Placeholder Text" />
  </>
));
