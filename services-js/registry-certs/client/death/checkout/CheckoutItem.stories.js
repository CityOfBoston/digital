// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';

import Cart from '../../store/Cart';
import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

import CheckoutItem from './CheckoutItem';

function makeProps(certificate) {
  const cart = new Cart();

  cart.add(certificate, 1);
  const item = cart.items[0];

  return {
    cart,
    item,
  };
}

storiesOf('CheckoutItem', module)
  .add('typical certificate', () =>
    <CheckoutItem {...makeProps(TYPICAL_CERTIFICATE)} />,
  )
  .add('pending certificate', () =>
    <CheckoutItem {...makeProps(PENDING_CERTIFICATE)} />,
  )
  .add('certificate without death date', () =>
    <CheckoutItem {...makeProps(NO_DATE_CERTIFICATE)} />,
  );
