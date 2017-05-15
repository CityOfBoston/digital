// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import LocationPopUp from './LocationPopUp';
import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';
import { CORNER_DIALOG_STYLE } from './RequestDialog';
import FormDialog from '../../common/FormDialog';

const props = {
  nextFunc: action('Next'),
  nextIsSubmit: false,
};

const makeRequestForm = (address: string) => {
  const requestForm = new RequestForm();
  requestForm.address = address;
  return requestForm;
};

storiesOf('LocationPopUp', module)
  .addDecorator((story) => (
    <div className={CORNER_DIALOG_STYLE}>
      <FormDialog noPadding>{story()}</FormDialog>
    </div>
  ))
  .add('with address', () => (
    <LocationPopUp {...props} requestForm={makeRequestForm('1 Franklin Park Rd\nBoston, MA 02121')} store={new AppStore()} />
  ))
  .add('without address', () => (
    <LocationPopUp {...props} requestForm={makeRequestForm('')} store={new AppStore()} />
  ))
  .add('address not found', () => {
    const store = new AppStore();
    store.mapLocation.notFound = true;

    return <LocationPopUp {...props} requestForm={makeRequestForm('')} store={store} />;
  });
