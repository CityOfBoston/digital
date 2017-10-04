// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import appLayoutDecorator from '../../../storybook/app-layout-decorator';

import { CertificatePageContent } from './CertificatePage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

storiesOf('CertificatePage', module)
  .addDecorator(appLayoutDecorator('checkout'))
  .add('normal certificate', () => (
    <CertificatePageContent
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={'/search?q=jayne'}
      addToCart={action('addToCart')}
      showAddedToCart={false}
      addedToCartQuantity={0}
      closeAddedToCart={action('closeAddedToCart')}
    />
  ))
  .add('normal certificate — added to cart', () => (
    <CertificatePageContent
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={'/search?q=jayne'}
      addToCart={action('addToCart')}
      showAddedToCart={true}
      addedToCartQuantity={5}
      closeAddedToCart={action('closeAddedToCart')}
    />
  ))
  .add('normal certificate — not from search', () => (
    <CertificatePageContent
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      backUrl={null}
      addToCart={action('addToCart')}
      showAddedToCart={false}
      addedToCartQuantity={0}
      closeAddedToCart={action('closeAddedToCart')}
    />
  ))
  .add('pending certificate', () => (
    <CertificatePageContent
      id={PENDING_CERTIFICATE.id}
      certificate={PENDING_CERTIFICATE}
      backUrl={'/search?q=jayne'}
      addToCart={action('addToCart')}
      showAddedToCart={false}
      addedToCartQuantity={0}
      closeAddedToCart={action('closeAddedToCart')}
    />
  ))
  .add('missing certificate', () => (
    <CertificatePageContent
      id="200001"
      certificate={null}
      backUrl={'/search?q=jayne'}
      addToCart={action('addToCart')}
      showAddedToCart={false}
      addedToCartQuantity={0}
      closeAddedToCart={action('closeAddedToCart')}
    />
  ));
