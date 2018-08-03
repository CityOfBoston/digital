import React from 'react';
import { storiesOf } from '@storybook/react';

import Cart from '../../store/Cart';
import SiteAnalytics from '../../lib/SiteAnalytics';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

import CartItem from './CartItem';

function makeProps(certificate) {
  const cart = new Cart();
  const siteAnalytics = new SiteAnalytics();

  cart.setQuantity(certificate, 1);
  const entry = cart.entries[0];

  return {
    cart,
    entry,
    siteAnalytics,
  };
}

storiesOf('CartItem', module)
  .add('typical certificate', () => (
    <CartItem {...makeProps(TYPICAL_CERTIFICATE)} lastRow />
  ))
  .add('pending certificate', () => (
    <CartItem {...makeProps(PENDING_CERTIFICATE)} lastRow />
  ))
  .add('certificate without death date', () => (
    <CartItem {...makeProps(NO_DATE_CERTIFICATE)} lastRow />
  ));
