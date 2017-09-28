// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Cart from '../../store/Cart';
import Order from '../../store/Order';

import appLayoutDecorator from '../../../storybook/app-layout-decorator';

import ShippingContent from './ShippingContent';

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

function makeOrder() {
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

storiesOf('ShippingContent', module)
  .addDecorator(appLayoutDecorator(null))
  .add('default', () => (
    <ShippingContent
      cart={makeCart()}
      order={new Order()}
      submit={action('submit')}
    />
  ))
  .add('existing address', () => (
    <ShippingContent
      cart={makeCart()}
      order={makeOrder()}
      submit={action('submit')}
    />
  ));
