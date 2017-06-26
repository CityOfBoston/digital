// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';

import { AppStore } from '../../data/store';
import CaseView from './CaseView';
import { MOCK_REQUEST } from './CaseLayout.test';

function makeStore() {
  const store = new AppStore();
  store.apiKeys = window.API_KEYS;
  return store;
}

storiesOf('CaseView', module)
  .addDecorator((next) => (
    <div className="b-c" style={{ background: 'white' }}>{next()}</div>
  ))
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
