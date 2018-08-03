import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Cart from '../../store/Cart';
import Order from '../../models/Order';

import ShippingContent from './ShippingContent';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

function makeCart() {
  const cart = new Cart();

  cart.setQuantity(TYPICAL_CERTIFICATE, 1);
  cart.setQuantity(PENDING_CERTIFICATE, 3);
  cart.setQuantity(NO_DATE_CERTIFICATE, 1);

  return cart;
}

function makeOrder(overrides = {}) {
  return new Order({
    storeContactAndShipping: true,
    storeBilling: false,

    contactName: 'Squirrel Girl',
    contactEmail: 'squirrel.girl@avengers.org',
    contactPhone: '(555) 123-9999',

    shippingName: 'Doreen Green',
    shippingCompanyName: 'Empire State University',
    shippingAddress1: 'Dorm Hall, Apt 5',
    shippingAddress2: '10 College Avenue',
    shippingCity: 'New York',
    shippingState: 'NY',
    shippingZip: '12345',

    cardholderName: 'Nancy Whitehead',
    cardLast4: '4040',

    billingAddressSameAsShippingAddress: true,

    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',

    ...overrides,
  });
}

storiesOf('ShippingContent', module)
  .add('default', () => (
    <ShippingContent
      cart={makeCart()}
      order={new Order()}
      submit={action('submit')}
    />
  ))
  .add('email error', () => (
    <ShippingContent
      cart={makeCart()}
      order={makeOrder({ contactEmail: 'notacompleteaddress@' })}
      submit={action('submit')}
      showErrorsForTest
    />
  ))
  .add('existing address', () => (
    <ShippingContent
      cart={makeCart()}
      order={makeOrder()}
      submit={action('submit')}
    />
  ));
