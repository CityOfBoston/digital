// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import centered from '../../../storybook/centered';
import LocationPopUp from './LocationPopUp';
import { AppStore } from '../../../data/store';

const props = {
  nextFunc: action('Next'),
  nextIsSubmit: true,
  loopbackGraphql: ({}: any),
};

const makeStore = (address: string) => {
  const store = new AppStore();

  store.requestForm.locationInfo.address = address;

  return store;
};

storiesOf('LocationPopUp', module)
  .addDecorator(centered)
  .add('with address', () => (
    <LocationPopUp {...props} store={makeStore('1 Franklin Park Rd\nBoston, MA 02121')} />
  ))
  .add('without address', () => (
    <LocationPopUp {...props} store={makeStore('')} />
  ));
