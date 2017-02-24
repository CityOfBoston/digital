// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import centered from '../../storybook/centered';
import LocationPopUp from './LocationPopUp';

const props = {
  next: action('Next'),
  addressSearch: async (s) => { action('Search')(s); return true; },
};

storiesOf('LocationPopUp', module)
  .addDecorator(centered)
  .add('with address', () => (
    <LocationPopUp {...props} address={'1 Franklin Park Rd\nBoston, MA 02121'} />
  ))
  .add('without address', () => (
    <LocationPopUp {...props} address={null} />
  ));
