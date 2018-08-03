import React from 'react';
import { storiesOf } from '@storybook/react';
import { runInAction } from 'mobx';

import Cart from '../../store/Cart';

import OrderDetails from './OrderDetails';

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

storiesOf('OrderDetails', module)
  .add('loading', () => <OrderDetails cart={makeCart(true)} />)
  .add('closed', () => <OrderDetails cart={makeCart(false)} />)
  .add('open', () => <OrderDetails cart={makeCart(false)} defaultOpen />)
  .add('fixed open', () => <OrderDetails cart={makeCart(false)} fixed />);
