// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
// We use the container rather than the component itself in order to get
// the apiKey and API script loaded.
import { LocationMapWithLib } from './LocationMap';
import { AppStore } from '../../../data/store';

const makeStore = () => {
  const store = new AppStore();
  store.apiKeys = window.API_KEYS;
  return store;
};

storiesOf('LocationMap', module)
  .addDecorator((story) => (
    <div style={{ width: '100vw', height: '100vh' }}>{ story() }</div>
  ))
  .add('inactive', () => (
    <LocationMapWithLib store={makeStore()} mode="inactive" setLocationMapSearch={() => {}} />
  ))
  .add('picker', () => (
    <LocationMapWithLib store={makeStore()} mode="picker" setLocationMapSearch={() => {}} />
  ));
