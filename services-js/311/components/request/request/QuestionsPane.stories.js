// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import type { Service } from '../../../data/types';
import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';

import { DEFAULT_SERVICE, SERVICE_WITH_METADATA } from './QuestionsPane.test';
import QuestionsPane from './QuestionsPane';
import FormDialog from '../../common/FormDialog';

const makeRequestForm = (service: Service) => {
  const requestForm = new RequestForm(service);
  requestForm.description = 'I could use some heroic supporti';
  return requestForm;
};

storiesOf('QuestionsPane', module)
.addDecorator((story) => (
  <div className="b-c">
    <FormDialog>{ story() }</FormDialog>
  </div>
))
.add('No Metadata', () => (
  <QuestionsPane
    store={new AppStore()}
    requestForm={makeRequestForm(DEFAULT_SERVICE)}
    serviceName={'Cosmic Incursion'}
    serviceDescription={'Bad things getting in from other universes'}
    nextFunc={action('Next Step')}
    nextIsSubmit
  />
))
.add('With Metadata', () => (
  <QuestionsPane
    store={new AppStore()}
    requestForm={makeRequestForm(SERVICE_WITH_METADATA)}
    serviceName={'Cosmic Incursion'}
    serviceDescription={'Bad things getting in from other universes'}
    nextFunc={action('Next Step')}
    nextIsSubmit={false}
  />
));
