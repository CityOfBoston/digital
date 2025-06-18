import React from 'react';
import { storiesOf } from '@storybook/react';
import { runInAction } from 'mobx';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import CertMailProvider from '../../store/CertifiedMailProvider';

import CartPage from './CartPage';

import CostSummary from '../../common/CostSummary';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

function makeCart(loading: boolean) {
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

storiesOf('Death/CartPage', module)
  .add('loading', () => (
    <CartPage
      deathCertificateCart={makeCart(true)}
      siteAnalytics={new GaSiteAnalytics()}
      certMailProvider={new CertMailProvider()}
      cardTypeProvider={{ get: () => new Promise(() => {}) } as any}
    />
  ))
  .add('normal page', () => (
    <CartPage
      deathCertificateCart={makeCart(false)}
      siteAnalytics={new GaSiteAnalytics()}
      certMailProvider={new CertMailProvider()}
      cardTypeProvider={{ get: () => new Promise(() => {}) } as any}
    />
  ))
  .add('empty cart', () => (
    <CartPage
      deathCertificateCart={new DeathCertificateCart()}
      siteAnalytics={new GaSiteAnalytics()}
      certMailProvider={new CertMailProvider()}
      cardTypeProvider={{ get: () => new Promise(() => {}) } as any}
    />
  ))
  .add('cost summary', () => (
    <CostSummary
      certificateType="death"
      certificateQuantity={2}
      allowServiceFeeTypeChoice
      // serviceFeeType="CREDIT"
      newServiceFeeType={'1'}
    />
  ))
  .add('cost summary w/certified mail tracking', () => (
    <CostSummary
      certificateType="death"
      certificateQuantity={2}
      allowServiceFeeTypeChoice
      // serviceFeeType="CREDIT"
      newServiceFeeType={'0'}
      tracking={true}
    />
  ));
