import React from 'react';
import { storiesOf } from '@storybook/react';
import TextInput from './TextInput';

storiesOf('TextInput', module)
  .add('default', () => (
    <TextInput
      title="Zip Code"
      name="zip"
      placeholder="Zip Code"
      value=""
      onChange=""
      onBlur=""
    />
  ))
  .add('required', () => (
    <TextInput
      title="Zip Code"
      name="zip"
      placeholder="Zip Code"
      required
      value=""
      onChange=""
      onBlur=""
    />
  ))
  .add('error', () => (
    <TextInput
      title="Zip Code"
      name="zip"
      placeholder="Zip Code"
      required
      error="Please Enter The Correct Zip Code, Zip Codes Contains 5 Digits."
      value=""
      onChange=""
      onBlur=""
    />
  ));
