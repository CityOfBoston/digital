// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from 'mobx';

import getStore from '../../data/store';
import page from '../../storybook/page';
import SearchLayout from './SearchLayout';

const makeStore = action((mapView: boolean) => {
  const store = getStore();
  store.requestSearch.mapView = mapView;
  return store;
});

storiesOf('SearchLayout', module)
  .addDecorator(page)
  .add('List View', () =>
    <SearchLayout
      store={makeStore(false)}
      data={{
        view: 'search',
        query: 'Alpha Flight',
        zoom: 12,
        location: {
          lat: 0,
          lng: 0,
        },
      }}
      noMap
    />
  )
  .add('Map View', () =>
    <SearchLayout
      store={makeStore(true)}
      data={{
        view: 'search',
        query: 'Alpha Flight',
        zoom: 12,
        location: {
          lat: 0,
          lng: 0,
        },
      }}
      noMap
    />
  );
