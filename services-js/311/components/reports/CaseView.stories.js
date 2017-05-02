// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';

import { AppStore } from '../../data/store';
import CaseView from './CaseView';
import { MOCK_REQUEST } from './ReportsLayout.test';

function makeStore() {
  const store = new AppStore();
  store.apiKeys = window.API_KEYS;
  return store;
}

storiesOf('CaseView', module)
.add('Submitted', () => (
  <div style={{ backgroundColor: 'white' }}>
    <CaseView request={{ ...MOCK_REQUEST, status: 'open' }} store={makeStore()} submitted />
  </div>
))
.add('Open', () => (
  <div style={{ backgroundColor: 'white' }}>
    <CaseView request={{ ...MOCK_REQUEST, status: 'open' }} store={makeStore()} />
  </div>
))
.add('Resolved', () => (
  <div style={{ backgroundColor: 'white' }}>
    <CaseView request={MOCK_REQUEST} store={makeStore()} />
  </div>
));
