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
  .add('inactive', () => (
    <LocationMapWithLib store={makeStore()} active={false} setLocationMapSearch={() => {}} />
  ))
  .add('active', () => (
    <LocationMapWithLib store={makeStore()} active setLocationMapSearch={() => {}} />
  ));
