// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';

import { GraphQLError } from '../../../data/graphql/loopback-graphql';
import SubmitPane from './SubmitPane';
import FormDialog from '../../common/FormDialog';

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
    error={new GraphQLError('GraphQL Server Error', [
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
