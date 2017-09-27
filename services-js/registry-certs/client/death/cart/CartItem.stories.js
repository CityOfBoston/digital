// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';

import Cart from '../../store/Cart';
import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

import CartItem from './CartItem';

function makeProps(certificate) {
  const cart = new Cart();

  cart.add(certificate, 1);
  const entry = cart.entries[0];

  return {
    cart,
    entry,
  };
}

storiesOf('CartItem', module)
  .add('typical certificate', () => (
    <CartItem {...makeProps(TYPICAL_CERTIFICATE)} />
  ))
  .add('pending certificate', () => (
    <CartItem {...makeProps(PENDING_CERTIFICATE)} />
  ))
  .add('certificate without death date', () => (
    <CartItem {...makeProps(NO_DATE_CERTIFICATE)} />
  ));
