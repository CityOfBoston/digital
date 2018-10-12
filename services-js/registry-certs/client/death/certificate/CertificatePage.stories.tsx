import React from 'react';
import { storiesOf } from '@storybook/react';

import SiteAnalytics from '../../lib/SiteAnalytics';
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

storiesOf('CertificatePage', module)
  .add('normal certificate', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new SiteAnalytics()}
    />
  ))
  .add('certificate in cart', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(5)}
      siteAnalytics={new SiteAnalytics()}
    />
  ))
  .add('normal certificate — not from search', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={null}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new SiteAnalytics()}
    />
  ))
  .add('pending certificate', () => (
    <CertificatePage
      id={PENDING_CERTIFICATE.id}
      certificate={PENDING_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new SiteAnalytics()}
    />
  ))
  .add('missing certificate', () => (
    <CertificatePage
      id="200001"
      certificate={null}
      backUrl={'/search?q=Jayn'}
      deathCertificateCart={makeCart(0)}
      siteAnalytics={new SiteAnalytics()}
    />
  ));
