// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import fullPageDecorator from '../../storybook/full-page-decorator';
import CertificatePage from './CertificatePage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

import Cart from '../store/Cart';

function makeCart() {
  return new Cart();
}

storiesOf('CertificatePage', module)
  .addDecorator(fullPageDecorator)
  .add('normal certificate', () => (
    <CertificatePage
      id={TYPICAL_CERTIFICATE.id}
      certificate={TYPICAL_CERTIFICATE}
      cart={makeCart()}
    />
  ))
  .add('pending certificate', () => (
    <CertificatePage
      id={PENDING_CERTIFICATE.id}
      certificate={PENDING_CERTIFICATE}
      cart={makeCart()}
    />
  ))
  .add('missing certificate', () => (
    <CertificatePage id="200001" certificate={null} cart={makeCart()} />
  ));
