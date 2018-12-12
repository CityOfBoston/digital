import React from 'react';
import { storiesOf } from '@storybook/react';
import { runInAction } from 'mobx';

import DeathCertificateCart from '../../store/DeathCertificateCart';

import { DeathOrderDetails, OrderDetailsDropdown } from './OrderDetails';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

function makeCart(loading: boolean): any {
  const cart = new DeathCertificateCart();

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

const loadingCart = makeCart(true);
const deathCart = makeCart(false);

storiesOf('Common Components/Order Details', module)
  .add('OrderDetailsDropdown: loading', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={loadingCart.size}
    >
      <DeathOrderDetails cart={loadingCart} />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: closed', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={deathCart.size}
    >
      <DeathOrderDetails cart={deathCart} />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: open', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={deathCart.size}
      startExpanded
    >
      <DeathOrderDetails cart={deathCart} />
    </OrderDetailsDropdown>
  ))
  .add('DeathOrderDetails', () => <DeathOrderDetails cart={deathCart} />);
