// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Cart from '../../store/Cart';
import Order from '../../store/Order';

import appLayoutDecorator from '../../../storybook/app-layout-decorator';

import PaymentContent from './PaymentContent';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

function makeCart() {
  const cart = new Cart();

  cart.add(TYPICAL_CERTIFICATE, 1);
  cart.add(PENDING_CERTIFICATE, 3);
  cart.add(NO_DATE_CERTIFICATE, 1);

  return cart;
}

function makeShippingCompleteOrder() {
  const order = new Order();

  order.info = {
    contactName: 'Squirrel Girl',
    contactEmail: 'squirrel.girl@avengers.org',
    contactPhone: '(555) 123-9999',

    shippingName: 'Doreen Green',
    shippingAddress1: 'Dorm Hall, Apt 5',
    shippingAddress2: 'Empire State University',
    shippingCity: 'New York',
    shippingState: 'NY',
    shippingZip: '12345',

    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
  };

  return order;
}

function makeBillingCompleteOrder() {
  const order = makeShippingCompleteOrder();

  Object.assign(order.info, {
    billingAddress1: '3 Avengers Towers',
    billingAddress2: '',
    billingCity: 'New York',
    billingState: 'NY',
    billingZip: '12223',
  });

  return order;
}

storiesOf('PaymentContent', module)
  .addDecorator(appLayoutDecorator(null))
  .add('default', () => (
    <PaymentContent
      cart={makeCart()}
      order={makeShippingCompleteOrder()}
      submit={action('submit')}
    />
  ))
  .add('existing billing', () => (
    <PaymentContent
      cart={makeCart()}
      order={makeBillingCompleteOrder()}
      submit={action('submit')}
    />
  ));
