// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import ContactPane from './ContactPane';
import FormDialog from '../../common/FormDialog';
import { SERVICE, EMPTY_REQUEST, FILLED_REQUEST } from './ContactPane.test';

storiesOf('ContactPane', module)
.addDecorator((story) => (
  <FormDialog>{ story() }</FormDialog>
))
.add('Empty', () => (
  <ContactPane
    service={SERVICE}
    request={EMPTY_REQUEST}
    nextFunc={action('Next Step')}
    setRequestFirstName={action('First Name Changed')}
    setRequestLastName={action('Last Name Changed')}
    setRequestEmail={action('Email Changed')}
    setRequestPhone={action('Phone Changed')}
  />
))
.add('Filled Out', () => (
  <ContactPane
    service={SERVICE}
    request={FILLED_REQUEST}
    nextFunc={action('Next Step')}
    setRequestFirstName={action('First Name Changed')}
    setRequestLastName={action('Last Name Changed')}
    setRequestEmail={action('Email Changed')}
    setRequestPhone={action('Phone Changed')}
  />
));
