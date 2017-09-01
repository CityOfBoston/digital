// @flow

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import LocationPopUp from './LocationPopUp';
import type { AddressUnit, SearchAddressPlace } from '../../../data/types';
import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';
import { CORNER_DIALOG_STYLE } from './RequestDialog';
import FormDialog from '../../common/FormDialog';

const props: any = {
  nextFunc: action('Next'),
  nextIsSubmit: false,
};

const makeStore = (places: ?Array<SearchAddressPlace>, opts = {}) => {
  const store = new AppStore();
  store.addressSearch.places = places;
  store.addressSearch.currentPlaceIndex = places
    ? Math.floor((places.length - 1) / 2)
    : 0;
  store.addressSearch.currentUnitIndex = 0;

  Object.assign(store.addressSearch, opts);

  return store;
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
  .addDecorator(story =>
    <div className={CORNER_DIALOG_STYLE}>
      <FormDialog noPadding>
        {story()}
      </FormDialog>
    </div>
  )
  .add('without address', () =>
    <LocationPopUp
      {...props}
      store={makeStore(null)}
      requestForm={new RequestForm()}
    />
  )
  .add('searching', () =>
    <LocationPopUp
      {...props}
      store={makeStore(null, {
        searching: true,
        query: '123 fake st',
      })}
      requestForm={new RequestForm()}
    />
  )
  .add('with address', () =>
    <LocationPopUp
      {...props}
      store={makeStore(
        [
          {
            address: '123 Fake St.\nDorchester, 02125',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            units: [],
          },
        ],
        {
          query: '123 fake street dorchester ma',
        }
      )}
      requestForm={new RequestForm()}
    />
  )
  .add('with units', () =>
    <LocationPopUp
      {...props}
      store={makeStore(
        [
          {
            address: '123 Fake St.\nBoston, MA 02121',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            units: MOCK_UNITS,
          },
        ],
        {
          query: '123 fake street dorchester ma',
        }
      )}
      requestForm={new RequestForm()}
    />
  )
  .add('with multiple addresses', () =>
    <LocationPopUp
      {...props}
      store={makeStore(
        [
          {
            address: '123 Fake St.\nDorchester, 02125',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            units: [],
          },
          {
            address: '123 Fake St.\nRoslindate, 02125',
            addressId: '12346',
            location: { lat: 0, lng: 0 },
            units: [],
          },
          {
            address: '123 Fake St.\nCharlestown, 02125',
            addressId: '12347',
            location: { lat: 0, lng: 0 },
            units: [],
          },
          {
            address: '123 Fake St.\nBoston, 02125',
            addressId: '12348',
            location: { lat: 0, lng: 0 },
            units: [],
          },
        ],
        {
          query: '123 fake street',
        }
      )}
      requestForm={new RequestForm()}
    />
  )
  .add('with multiple addresses and units', () =>
    <LocationPopUp
      {...props}
      store={makeStore(
        [
          {
            address: '123 Fake St.\nDorchester, 02125',
            addressId: '12345',
            location: { lat: 0, lng: 0 },
            units: [],
          },
          {
            address: '123 Fake St.\nRoslindate, 02125',
            addressId: '12346',
            location: { lat: 0, lng: 0 },
            units: MOCK_UNITS,
          },
          {
            address: '123 Fake St.\nCharlestown, 02125',
            addressId: '12347',
            location: { lat: 0, lng: 0 },
            units: MOCK_UNITS,
          },
          {
            address: '123 Fake St.\nBoston, 02125',
            addressId: '12348',
            location: { lat: 0, lng: 0 },
            units: MOCK_UNITS,
          },
        ],
        {
          query: '123 fake street',
        }
      )}
      requestForm={new RequestForm()}
    />
  )
  .add('address not found', () =>
    <LocationPopUp
      {...props}
      store={makeStore([], {
        query: '123 fake street',
      })}
      requestForm={new RequestForm()}
    />
  );
