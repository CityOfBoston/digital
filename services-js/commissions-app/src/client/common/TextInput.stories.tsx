import React from 'react';
import { storiesOf } from '@storybook/react';
import TextInput from './TextInput';

storiesOf('TextInput', module)
  .add('default', () => (
    <TextInput title="First Name" name="firstName" placeholder="First Name" />
  ))
  .add('required', () => (
    <TextInput
      title="First Name"
      name="firstName"
      placeholder="First Name"
      required
    />
  ));
