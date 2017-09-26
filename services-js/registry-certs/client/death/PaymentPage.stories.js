// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { runInAction } from 'mobx';

import { PaymentPageContent } from './PaymentPage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

import Cart from '../store/Cart';

function makeCart(loading: boolean) {
  const cart = new Cart();

  if (loading) {
    runInAction(() => {
      cart.pendingFetches = 2;
      cart.items = ([
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

storiesOf('PaymentPage', module)
  .add('loading', () => (
    <PaymentPageContent cart={makeCart(true)} submit={action('submit')} />
  ))
  .add('normal page', () => (
    <PaymentPageContent cart={makeCart(false)} submit={action('submit')} />
  ));
