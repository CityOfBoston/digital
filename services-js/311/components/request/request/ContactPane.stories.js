// @flow

import React from 'react';
import { storiesOf, action } from '@storybook/react';

import RequestForm from '../../../data/store/RequestForm';

import ContactPane from './ContactPane';
import FormDialog from '../../common/FormDialog';

const makeRequestForm = (fillIn: boolean) => {
  const requestForm = new RequestForm();

  if (fillIn) {
    requestForm.firstName = 'Carol';
    requestForm.lastName = 'Danvers';
    requestForm.email = 'marvel@alphaflight.gov';
    requestForm.phone = '6175551234';
  }

  return requestForm;
};

storiesOf('ContactPane', module)
.addDecorator((story) => (
  <div className="b-c">
    <FormDialog>{ story() }</FormDialog>
  </div>
))
.add('Empty', () => (
  <ContactPane
    serviceName="Cosmic Incursion"
    requestForm={makeRequestForm(false)}
    nextFunc={action('Next Step')}
  />
))
.add('Filled Out', () => (
  <ContactPane
    serviceName="Cosmic Incursion"
    requestForm={makeRequestForm(true)}
    nextFunc={action('Next Step')}
  />
));
