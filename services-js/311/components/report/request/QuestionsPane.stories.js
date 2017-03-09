// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import { AppStore } from '../../../data/store';

import { DEFAULT_SERVICE, SERVICE_WITH_METADATA } from './QuestionsPane.test';
import QuestionsPane from './QuestionsPane';
import FormDialog from '../../common/FormDialog';

const makeStore = (service) => {
  const store = new AppStore();
  store.description = 'I could use some heroic support.';
  store.currentService = service;
  return store;
};

storiesOf('QuestionsPane', module)
.addDecorator((story) => (
  <FormDialog>{ story() }</FormDialog>
))
.add('No Metadata', () => (
  <QuestionsPane
    store={makeStore(DEFAULT_SERVICE)}
    nextFunc={action('Next Step')}
  />
))
.add('With Metadata', () => (
  <QuestionsPane
    store={makeStore(SERVICE_WITH_METADATA)}
    nextFunc={action('Next Step')}
  />
));
