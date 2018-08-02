import React from 'react';
import { storiesOf } from '@storybook/react';
import { runInAction } from 'mobx';

import Cart from '../../store/Cart';

import CartPage from './CartPage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

function makeCart(loading: boolean) {
  const cart = new Cart();

  if (loading) {
    runInAction(() => {
      cart.pendingFetches = 2;
      cart.entries = [
        {
          id: TYPICAL_CERTIFICATE.id,
          cert: null,
          quantity: 5,
        },
        {
          id: PENDING_CERTIFICATE.id,
          cert: null,
          quantity: 3,
        },
      ] as any;
    });
  } else {
    cart.setQuantity(TYPICAL_CERTIFICATE, 1);
    cart.setQuantity(PENDING_CERTIFICATE, 3);
    cart.setQuantity(NO_DATE_CERTIFICATE, 1);
  }

  return cart;
}

storiesOf('CartPage', module)
  .add('loading', () => <CartPage cart={makeCart(true)} />)
  .add('normal page', () => <CartPage cart={makeCart(false)} />)
  .add('empty cart', () => <CartPage cart={new Cart()} />);
