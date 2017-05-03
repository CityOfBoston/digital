// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import LocationMap from './LocationMap';
import { AppStore } from '../../data/store';

const makeStore = () => {
  const store = new AppStore();
  store.apiKeys = window.API_KEYS;
  return store;
};

storiesOf('LocationMap', module)
  .add('inactive', () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LocationMap store={makeStore()} mode="inactive" mobile={false} />
    </div>
  ))
  .add('picker', () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LocationMap store={makeStore()} mode="picker" mobile={false} />
    </div>
  ));
