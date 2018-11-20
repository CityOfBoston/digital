import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../../store/DeathCertificateCart';

import CertificatePage from './CertificatePage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

const makeCart = (quantity: number) => {
  const cart = new DeathCertificateCart();

  if (quantity) {
    cart.setQuantity(TYPICAL_CERTIFICATE, quantity);
  }

  return cart;
};

storiesOf('Death/CertificatePage', module)
  .add('normal certificate', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ))
  .add('certificate in cart', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(5)}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ))
  .add('normal certificate — not from search', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={null}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ))
  .add('pending certificate', () => (
    <CertificatePage
      id={PENDING_CERTIFICATE.id}
      certificate={PENDING_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ))
  .add('missing certificate', () => (
    <CertificatePage
      id="200001"
      certificate={null}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ));
