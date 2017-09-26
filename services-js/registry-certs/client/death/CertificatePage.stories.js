// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CertificatePageContent } from './CertificatePage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

import Cart from '../store/Cart';

function makeCart() {
  return new Cart();
}

storiesOf('CertificatePage', module)
  .add('normal certificate', () => (
    <CertificatePageContent
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      cart={makeCart()}
      addToCart={action('addToCart')}
    />
  ))
  .add('pending certificate', () => (
    <CertificatePageContent
      id={PENDING_CERTIFICATE.id}
      certificate={PENDING_CERTIFICATE}
      cart={makeCart()}
      addToCart={action('addToCart')}
    />
  ))
  .add('missing certificate', () => (
    <CertificatePageContent
      id="200001"
      certificate={null}
      cart={makeCart()}
      addToCart={action('addToCart')}
    />
  ));
