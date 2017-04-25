// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import LocationMap from './LocationMap';
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
    <LocationMap store={makeStore()} opacityRatio={0} mode="inactive" loopbackGraphql={(() => {}: any)} />
  ))
  .add('picker', () => (
    <LocationMap store={makeStore()} opacityRatio={1} mode="picker" loopbackGraphql={(() => {}: any)} />
  ));
