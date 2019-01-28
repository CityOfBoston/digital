import React from 'react';
import { storiesOf } from '@storybook/react';
import { runInAction } from 'mobx';

import DeathCertificateCart from '../../store/DeathCertificateCart';

import { OrderDetails, OrderDetailsDropdown } from './OrderDetails';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';

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

function makeBirthCertificateRequest(): BirthCertificateRequest {
  const request = new BirthCertificateRequest();

  request.quantity = 4;
  request.answerQuestion({
    firstName: 'Carol',
    lastName: 'Danvers',
    birthDate: '3/5/1968',
  });

  return request;
}

const loadingCart = makeCart(true);
const deathCart = makeCart(false);

storiesOf('Common Components/Order Details', module)
  .add('OrderDetailsDropdown: loading', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={loadingCart.size}
    >
      <OrderDetails type="death" deathCertificateCart={loadingCart} />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: closed', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={deathCart.size}
    >
      <OrderDetails type="death" deathCertificateCart={deathCart} />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: open', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={deathCart.size}
      startExpanded
    >
      <OrderDetails type="death" deathCertificateCart={deathCart} />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: birth open', () => (
    <OrderDetailsDropdown
      orderType="birth"
      certificateQuantity={4}
      startExpanded
    >
      <OrderDetails
        type="birth"
        birthCertificateRequest={makeBirthCertificateRequest()}
      />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetails: death', () => (
    <OrderDetails type="death" deathCertificateCart={deathCart} />
  ))
  .add('OrderDetails: birth', () => (
    <OrderDetails
      type="birth"
      birthCertificateRequest={makeBirthCertificateRequest()}
    />
  ));
