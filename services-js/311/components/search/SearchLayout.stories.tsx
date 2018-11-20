import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from 'mobx';

import RequestSearch from '../../data/store/RequestSearch';
import Ui from '../../data/store/Ui';
import BrowserLocation from '../../data/store/BrowserLocation';
import AddressSearch from '../../data/store/AddressSearch';

import page from '../../.storybook/page';
import SearchLayout from './SearchLayout';

const makeRequestSearch = action((mapView: boolean) =>
  Object.assign(new RequestSearch(), { mapView })
);

storiesOf('SearchLayout', module)
  .addDecorator(page)
  .add('List View', () => (
    <SearchLayout
      requestSearch={makeRequestSearch(false)}
      addressSearch={new AddressSearch()}
      browserLocation={new BrowserLocation()}
      fetchGraphql={null as any}
      ui={new Ui()}
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
  ))
  .add('Map View', () => (
    <SearchLayout
      requestSearch={makeRequestSearch(true)}
      addressSearch={new AddressSearch()}
      browserLocation={new BrowserLocation()}
      fetchGraphql={null as any}
      ui={new Ui()}
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
  ));
