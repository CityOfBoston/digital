// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import LocationPopUp from './LocationPopUp';
import type { AddressUnit } from '../../../data/types';
import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';
import { CORNER_DIALOG_STYLE } from './RequestDialog';
import FormDialog from '../../common/FormDialog';

const props = {
  nextFunc: action('Next'),
  nextIsSubmit: false,
};

const makeStore = (address: string, units, notFound: boolean) => {
  const store = new AppStore();
  store.mapLocation.notFound = notFound;
  store.mapLocation.units = units;
  store.mapLocation.address = address;

  return store;
};

const MOCK_UNITS: Array<AddressUnit> = [
  {
    address: '50 Milk St\nBoston, MA, 02108',
    streetAddress: '50 Milk St',
    unit: '',
    addressId: '95446',
  },
  {
    address: '50 Milk St Ste 16\nBoston, MA, 02108',
    streetAddress: '50 Milk St Ste 16',
    unit: 'Ste 16',
    addressId: '275490',
  },
  {
    address: '50 Milk St Ste 17\nBoston, MA, 02108',
    streetAddress: '50 Milk St Ste 17',
    unit: 'Ste 17',
    addressId: '275491',
  },
  {
    address: '50 Milk St #20\nBoston, MA, 02108',
    streetAddress: '50 Milk St #20',
    unit: '20',
    addressId: '275492',
  },
  {
    address: '50 Milk St #2050\nBoston, MA, 02108',
    streetAddress: '50 Milk St #2050',
    unit: '2050',
    addressId: '275493',
  },
  {
    address: '50 Milk St Ste 21\nBoston, MA, 02108',
    streetAddress: '50 Milk St Ste 21',
    unit: 'Ste 21',
    addressId: '275494',
  },
  {
    address: '50 Milk St Lbby A\nBoston, MA, 02108',
    streetAddress: '50 Milk St Lbby A',
    unit: 'Lbby A',
    addressId: '275495',
  },
  {
    address: '50 Milk St Lbby C\nBoston, MA, 02108',
    streetAddress: '50 Milk St Lbby C',
    unit: 'Lbby C',
    addressId: '275496',
  },
  {
    address: '121 Devonshire St\nBoston, MA, 02108',
    streetAddress: '121 Devonshire St',
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
  .add('with address', () =>
    <LocationPopUp
      {...props}
      store={makeStore('1 Franklin Park Rd\nBoston, MA 02121', [], false)}
      requestForm={new RequestForm()}
    />
  )
  .add('with units', () =>
    <LocationPopUp
      {...props}
      store={makeStore(
        '1 Franklin Park Rd\nBoston, MA 02121',
        MOCK_UNITS,
        false
      )}
      requestForm={new RequestForm()}
    />
  )
  .add('without address', () =>
    <LocationPopUp
      {...props}
      store={makeStore('', [], false)}
      requestForm={new RequestForm()}
    />
  )
  .add('address not found', () =>
    <LocationPopUp
      {...props}
      store={makeStore('', [], true)}
      requestForm={new RequestForm()}
    />
  );
