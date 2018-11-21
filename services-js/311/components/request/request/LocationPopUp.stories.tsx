import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { ScreenReaderSupport } from '@cityofboston/next-client-common';

import LocationPopUp from './LocationPopUp';
import { AddressUnit, SearchAddressPlace } from '../../../data/types';
import BrowserLocation from '../../../data/store/BrowserLocation';
import RequestSearch from '../../../data/store/RequestSearch';
import Ui from '../../../data/store/Ui';
import AddressSearch from '../../../data/store/AddressSearch';
import RequestForm from '../../../data/store/RequestForm';
import { CORNER_DIALOG_STYLE } from './RequestDialog';
import FormDialog from '../../common/FormDialog';

const DEFAULT_PROPS = {
  browserLocation: new BrowserLocation(),
  screenReaderSupport: new ScreenReaderSupport(),
  requestSearch: new RequestSearch(),
  ui: new Ui(),
  requestForm: new RequestForm(),
  nextFunc: action('Next'),
  nextIsSubmit: false,
};

const makeAddressSearch = (
  places: Array<SearchAddressPlace> | null,
  opts?: Partial<AddressSearch>
) => {
  const addressSearch = new AddressSearch();
  addressSearch.setPlaces(places, 'search', true);
  addressSearch.currentPlaceIndex = places
    ? Math.floor((places.length - 1) / 2)
    : 0;

  if (opts) {
    Object.assign(addressSearch, opts);
  }

  return addressSearch;
};

const MOCK_UNITS: Array<AddressUnit> = [
  {
    address: '123 Fake St.\nBoston, MA, 02108',
    streetAddress: '123 Fake St.',
    unit: '',
    addressId: '95446',
  },
  {
    address: '123 Fake St. Ste 16\nBoston, MA, 02108',
    streetAddress: '123 Fake St. Ste 16',
    unit: 'Ste 16',
    addressId: '275490',
  },
  {
    address: '123 Fake St. Ste 17\nBoston, MA, 02108',
    streetAddress: '123 Fake St. Ste 17',
    unit: 'Ste 17',
    addressId: '275491',
  },
  {
    address: '123 Fake St. #20\nBoston, MA, 02108',
    streetAddress: '123 Fake St. #20',
    unit: '20',
    addressId: '275492',
  },
  {
    address: '123 Fake St. #2050\nBoston, MA, 02108',
    streetAddress: '123 Fake St. #2050',
    unit: '2050',
    addressId: '275493',
  },
  {
    address: '123 Fake St. Ste 21\nBoston, MA, 02108',
    streetAddress: '123 Fake St. Ste 21',
    unit: 'Ste 21',
    addressId: '275494',
  },
  {
    address: '123 Fake St. Lbby A\nBoston, MA, 02108',
    streetAddress: '123 Fake St. Lbby A',
    unit: 'Lbby A',
    addressId: '275495',
  },
  {
    address: '123 Fake St. Lbby C\nBoston, MA, 02108',
    streetAddress: '123 Fake St. Lbby C',
    unit: 'Lbby C',
    addressId: '275496',
  },
  {
    address: '121 Other St\nBoston, MA, 02108',
    streetAddress: '121 Other St',
    unit: '',
    addressId: '419918',
  },
];

storiesOf('LocationPopUp', module)
  .addDecorator(story => (
    <div className={CORNER_DIALOG_STYLE}>
      <FormDialog noPadding>{story()}</FormDialog>
    </div>
  ))
  .add('without address', () => (
    <LocationPopUp {...DEFAULT_PROPS} addressSearch={makeAddressSearch(null)} />
  ))
  .add('searching', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(null, {
        searching: true,
        query: '123 fake st',
      })}
    />
  ))
  .add('with address', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(
        [
          {
            address: '123 Fake St.\nDorchester, 02125',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: [],
          },
        ],
        {
          query: '123 fake street dorchester ma',
          lastQuery: '123 fake street dorchester ma',
        }
      )}
    />
  ))
  .add('with inexact address', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(
        [
          {
            address: '123 Fake St.\nDorchester, 02125',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            exact: false,
            alwaysUseLatLng: false,
            units: [],
          },
        ],
        {
          query: '123 fake street dorchester ma',
          lastQuery: '123 fake street dorchester ma',
        }
      )}
    />
  ))
  .add('with units', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(
        [
          {
            address: '123 Fake St.\nBoston, MA 02121',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: MOCK_UNITS,
          },
        ],
        {
          query: '123 fake street dorchester ma',
          lastQuery: '123 fake street dorchester ma',
        }
      )}
    />
  ))
  .add('with multiple addresses', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(
        [
          {
            address: '123 Fake St.\nDorchester, 02125',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: [],
          },
          {
            address: '123 Fake St.\nRoslindate, 02125',
            addressId: '12346',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: [],
          },
          {
            address: '123 Fake St.\nCharlestown, 02125',
            addressId: '12347',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: [],
          },
          {
            address: '123 Fake St.\nBoston, 02125',
            addressId: '12348',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: [],
          },
        ],
        {
          query: '123 fake street',
          lastQuery: '123 fake street',
        }
      )}
    />
  ))
  .add('with multiple addresses and units', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(
        [
          {
            address: '123 Fake St.\nDorchester, 02125',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: [],
          },
          {
            address: '123 Fake St.\nRoslindate, 02125',
            addressId: '12346',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: MOCK_UNITS,
          },
          {
            address: '123 Fake St.\nCharlestown, 02125',
            addressId: '12347',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: MOCK_UNITS,
          },
          {
            address: '123 Fake St.\nBoston, 02125',
            addressId: '12348',
            location: { lat: 0, lng: 0 },
            exact: true,
            alwaysUseLatLng: false,
            units: MOCK_UNITS,
          },
        ],
        {
          query: '123 fake street',
          lastQuery: '123 fake street',
        }
      )}
    />
  ))
  .add('address not found', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch([], {
        query: '123 fake street',
        lastQuery: '123 fake street',
      })}
    />
  ))
  .add('search error', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(null, {
        query: '123 fake street',
        lastQuery: '123 fake street',
        lastSearchError: new Error('SERVER ERROR THINGS ARE BROKEN'),
      })}
    />
  ))
  .add('geocode error', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      addressSearch={makeAddressSearch(null, {
        currentReverseGeocodeLocation: { lat: 2, lng: 3 },
        lastQuery: '123 fake street',
        lastSearchError: new Error('SERVER ERROR THINGS ARE BROKEN'),
      })}
    />
  ))
  .add('outside of Boston', () => (
    <LocationPopUp
      {...DEFAULT_PROPS}
      selectedCityForTest="Cambridge"
      addressSearch={makeAddressSearch([], {
        currentReverseGeocodeLocation: { lat: 2, lng: 3 },
        lastQuery: '123 fake street',
      })}
    />
  ));
