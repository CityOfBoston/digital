// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { runInAction } from 'mobx';

import Cart from '../../store/Cart';

import appLayoutDecorator from '../../../storybook/app-layout-decorator';

import { CartPageContent } from './CartPage';

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
      cart.entries = ([
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
      ]: any);
    });
  } else {
    cart.add(TYPICAL_CERTIFICATE, 1);
    cart.add(PENDING_CERTIFICATE, 3);
    cart.add(NO_DATE_CERTIFICATE, 1);
  }

  return cart;
}

storiesOf('CartPage', module)
  .addDecorator(appLayoutDecorator(true))
  .add('loading', () => <CartPageContent cart={makeCart(true)} />)
  .add('normal page', () => <CartPageContent cart={makeCart(false)} />)
  .add('empty cart', () => <CartPageContent cart={new Cart()} />);
