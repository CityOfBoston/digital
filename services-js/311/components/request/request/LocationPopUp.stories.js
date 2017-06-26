// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import LocationPopUp from './LocationPopUp';
import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';
import { CORNER_DIALOG_STYLE } from './RequestDialog';
import FormDialog from '../../common/FormDialog';

const props = {
  nextFunc: action('Next'),
  nextIsSubmit: false,
};

const makeStore = (address: string, notFound: boolean) => {
  const store = new AppStore();
  store.mapLocation.notFound = notFound;
  store.mapLocation.address = address;

  return store;
};

storiesOf('LocationPopUp', module)
  .addDecorator((story) => (
    <div className={CORNER_DIALOG_STYLE}>
      <FormDialog noPadding>{story()}</FormDialog>
    </div>
  ))
  .add('with address', () => (
    <LocationPopUp {...props} store={makeStore('1 Franklin Park Rd\nBoston, MA 02121', false)} requestForm={new RequestForm()} />
  ))
  .add('without address', () => (
    <LocationPopUp {...props} store={makeStore('', false)} requestForm={new RequestForm()} />
  ))
  .add('address not found', () => <LocationPopUp {...props} store={makeStore('', true)} requestForm={new RequestForm()} />);
