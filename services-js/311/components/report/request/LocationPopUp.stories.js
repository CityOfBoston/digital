// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import centered from '../../../storybook/centered';
import LocationPopUp from './LocationPopUp';
import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';

const props = {
  nextFunc: action('Next'),
  nextIsSubmit: true,
  loopbackGraphql: ({}: any),
};

const makeStore = (address: string) => {
  const store = new AppStore();
  store.mapLocation.address = address;
  return store;
};

storiesOf('LocationPopUp', module)
  .addDecorator(centered)
  .add('with address', () => (
    <LocationPopUp {...props} store={makeStore('1 Franklin Park Rd\nBoston, MA 02121')} requestForm={new RequestForm()} />
  ))
  .add('without address', () => (
    <LocationPopUp {...props} store={makeStore('')} requestForm={new RequestForm()} />
  ));
