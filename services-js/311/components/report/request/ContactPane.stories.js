// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import { AppStore } from '../../../data/store';

import ContactPane from './ContactPane';
import FormDialog from '../../common/FormDialog';

const makeStore = (fillIn: boolean) => {
  const store = new AppStore();

  if (fillIn) {
    store.contactInfo.firstName = 'Carol';
    store.contactInfo.lastName = 'Danvers';
    store.contactInfo.email = 'marvel@alphaflight.gov';
    store.contactInfo.phone = '6175551234';
  }

  return store;
};

storiesOf('ContactPane', module)
.addDecorator((story) => (
  <FormDialog>{ story() }</FormDialog>
))
.add('Empty', () => (
  <ContactPane
    store={makeStore(false)}
    nextFunc={action('Next Step')}
  />
))
.add('Filled Out', () => (
  <ContactPane
    store={makeStore(true)}
    nextFunc={action('Next Step')}
  />
));
