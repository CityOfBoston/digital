import React from 'react';
import { storiesOf } from '@storybook/react';
import DeviceVerificationForm, { FormValues } from './DeviceVerificationForm';
import { action } from '@storybook/addon-actions';

const DEFAULT_VALUES: FormValues = {
  phoneOrEmail: 'phone',
  email: '',
  phoneNumber: '',
  smsOrVoice: 'sms',
};

const DEFAULT_PROPS = {
  values: DEFAULT_VALUES,
  errors: {},
  touched: {},
  handleSubmit: action('handleSubmit'),
  handleChange: action('handleChange'),
  handleBlur: action('handleBlur'),
  isSubmitting: false,
  isValid: true,
  serverError: null,
  phoneOrEmail: 'phone' as 'phone',
};

storiesOf('RegisterMfaPage/DeviceVerificationForm', module)
  .add('phone', () => <DeviceVerificationForm {...DEFAULT_PROPS} />)
  .add('email with error', () => (
    <DeviceVerificationForm
      {...DEFAULT_PROPS}
      values={{
        ...DEFAULT_VALUES,
        phoneOrEmail: 'email',
        email: 'notanemail.com',
      }}
      errors={{ email: 'This doesn’t look like an email address.' }}
      touched={{ email: true }}
      isValid={false}
    />
  ))
  .add('code sending error', () => (
    <DeviceVerificationForm
      {...DEFAULT_PROPS}
      serverError="We weren’t able to send to that address. Please try something else."
    />
  ));
