import React from 'react';
import { storiesOf } from '@storybook/react';

import Cart from '../store/Cart';

import CostSummary from './CostSummary';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

function makeCart() {
  const cart = new Cart();

  cart.setQuantity(TYPICAL_CERTIFICATE, 1);
  cart.setQuantity(PENDING_CERTIFICATE, 3);
  cart.setQuantity(NO_DATE_CERTIFICATE, 1);

  return cart;
}

storiesOf('CostSummary', module)
  .add('default credit card', () => (
    <CostSummary
      cart={makeCart()}
      allowServiceFeeTypeChoice
      serviceFeeType="CREDIT"
    />
  ))
  .add('default debit card', () => (
    <CostSummary
      cart={makeCart()}
      allowServiceFeeTypeChoice
      serviceFeeType="DEBIT"
    />
  ))
  .add('only credit card', () => (
    <CostSummary cart={makeCart()} serviceFeeType="CREDIT" />
  ))
  .add('only debit card', () => (
    <CostSummary cart={makeCart()} serviceFeeType="DEBIT" />
  ));
