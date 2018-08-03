import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { DeathCertificate } from '../../types.js';
import Cart from '../../store/Cart';
import Order from '../../models/Order';

import ReviewContent from './ReviewContent';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

function makeCart(extraCerts?: Array<DeathCertificate>) {
  const cart = new Cart();

  cart.setQuantity(TYPICAL_CERTIFICATE, 1);
  cart.setQuantity(NO_DATE_CERTIFICATE, 5);

  (extraCerts || []).forEach(cert => cart.setQuantity(cert, 2));

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

    billingAddressSameAsShippingAddress: false,

    billingAddress1: '3 Avengers Towers',
    billingAddress2: '',
    billingCity: 'New York',
    billingState: 'NY',
    billingZip: '12223',

    ...overrides,
  });
}

storiesOf('ReviewContent', module)
  .add('default', () => (
    <ReviewContent
      cart={makeCart()}
      order={makeOrder()}
      submit={action('submit')}
    />
  ))
  .add('cart has pending certs', () => (
    <ReviewContent
      cart={makeCart([PENDING_CERTIFICATE])}
      order={makeOrder()}
      submit={action('submit')}
    />
  ))
  .add('submission error', () => (
    <ReviewContent
      cart={makeCart()}
      order={(() => {
        const order = makeOrder();
        order.processingError = 'The order could not be processed.';

        return order;
      })()}
      submit={action('submit')}
      showErrorsForTest
    />
  ));
