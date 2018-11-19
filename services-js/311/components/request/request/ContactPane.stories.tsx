import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

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
  .addDecorator(story => (
    <div className="b-c">
      <FormDialog>{story()}</FormDialog>
    </div>
  ))
  .add('Empty', () => (
    <ContactPane
      key="empty"
      serviceName="Cosmic Incursion"
      requestForm={makeRequestForm(false)}
      nextFunc={action('Next Step')}
      noLocalStorage
    />
  ))
  .add('Filled Out', () => (
    <ContactPane
      key="filled-in"
      serviceName="Cosmic Incursion"
      requestForm={makeRequestForm(true)}
      nextFunc={action('Next Step')}
      noLocalStorage
    />
  ));
