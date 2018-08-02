import React from 'react';
import { storiesOf } from '@storybook/react';

import Cart from '../../store/Cart';

import CertificatePage from './CertificatePage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

const makeCart = (quantity: number) => {
  const cart = new Cart();

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
      cart={makeCart(0)}
    />
  ))
  .add('certificate in cart', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      cart={makeCart(5)}
    />
  ))
  .add('normal certificate — not from search', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={null}
      cart={makeCart(0)}
    />
  ))
  .add('pending certificate', () => (
    <CertificatePage
      id={PENDING_CERTIFICATE.id}
      certificate={PENDING_CERTIFICATE}
      backUrl={'/search?q=Jayn'}
      cart={makeCart(0)}
    />
  ))
  .add('missing certificate', () => (
    <CertificatePage
      id="200001"
      certificate={null}
      backUrl={'/search?q=Jayn'}
      cart={makeCart(0)}
    />
  ));
