// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';

import SubmitPane from './SubmitPane';
import FormDialog from '../../common/FormDialog';

const makeError = (message, errors) => {
  const error: Object = new Error(message);
  error.errors = errors;
  return error;
};

storiesOf('SubmitPane', module)
.addDecorator((story) => (
  <FormDialog>{ story() }</FormDialog>
))
.add('Submitting', () => (
  <SubmitPane state="submitting" />
))
.add('Network Error', () => (
  <SubmitPane state="error" error={new TypeError('Failed to fetch')} />
))
.add('GraphQL Error', () => (
  <SubmitPane
    state="error"
    error={makeError('GraphQL Server Error', [
      { message: 'firstName is a required field' },
      { message: 'lastName is a required field' },
    ])}
  />
))
.add('Success', () => (
  <SubmitPane
    state="success"
    submittedRequest={{
      id: '17-00001615',
      status: 'open',
      requestedAt: 1488464201,
    }}
  />
));
