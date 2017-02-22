// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import ReportFormDialog from './ReportFormDialog';
import makeLoopbackGraphql from '../../data/graphql/__mocks__/loopback-graphql';

const EMPTY_REQUEST = {
  code: null,
  description: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  attributes: {},
};

storiesOf('ReportFormDialog', module)
.add('Not Found', () => (
  <ReportFormDialog
    loopbackGraphql={makeLoopbackGraphql()}
    service={null}
    request={EMPTY_REQUEST}
    onFirstNameChange={action('First Name Change')}
    onLastNameChange={action('Last Name Change')}
    onEmailChange={action('Email Change')}
    onPhoneChange={action('Phone Change')}
    onShowService={action('Showing Service')}
    onAttributeChange={action('Attribute Changed')}
  />
));
