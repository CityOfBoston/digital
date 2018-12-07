import React from 'react';
import { storiesOf } from '@storybook/react';

import DeathCertificateCart from '../store/DeathCertificateCart';

import CostSummary from './CostSummary';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

function makeCart() {
  const cart = new DeathCertificateCart();

  cart.setQuantity(TYPICAL_CERTIFICATE, 1);
  cart.setQuantity(PENDING_CERTIFICATE, 3);
  cart.setQuantity(NO_DATE_CERTIFICATE, 1);

  return cart;
}

storiesOf('Common Components/CostSummary', module)
  .add('default credit card', () => (
    <CostSummary
      certificateType="death"
      certificateQuantity={makeCart().size}
      allowServiceFeeTypeChoice
      serviceFeeType="CREDIT"
    />
  ))
  .add('default debit card', () => (
    <CostSummary
      certificateType="death"
      certificateQuantity={makeCart().size}
      allowServiceFeeTypeChoice
      serviceFeeType="DEBIT"
    />
  ))
  .add('only credit card', () => (
    <CostSummary
      certificateType="death"
      certificateQuantity={makeCart().size}
      serviceFeeType="CREDIT"
    />
  ))
  .add('only debit card', () => (
    <CostSummary
      certificateType="death"
      certificateQuantity={makeCart().size}
      serviceFeeType="DEBIT"
    />
  ))
  .add('with research fee', () => (
    <CostSummary
      certificateType="birth"
      certificateQuantity={1}
      allowServiceFeeTypeChoice
      serviceFeeType="DEBIT"
      hasResearchFee
    />
  ));
