import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { DeathCertificate } from '../../types';
import Cart from '../../store/DeathCertificateCart';
import Order, { OrderInfo } from '../../models/Order';

import { SubmissionError } from '../../dao/CheckoutDao';
import { OrderErrorCause } from '../../queries/graphql-types';

import ReviewContent from './ReviewContent';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

import {
  makeBirthCertificateRequest,
  makeMarriageCertificateRequest,
} from './ShippingContent.stories';

function makeCart(extraCerts?: Array<DeathCertificate>) {
  const cart = new Cart();

  cart.setQuantity(TYPICAL_CERTIFICATE, 1);
  cart.setQuantity(NO_DATE_CERTIFICATE, 5);

  (extraCerts || []).forEach(cert => cart.setQuantity(cert, 2));

  return cart;
}

function makeOrder(overrides: Partial<OrderInfo> = {}) {
  return new Order({
    storeContactAndShipping: true,
    storeBilling: false,

    contactName: 'Squirrel Girl',
    contactEmail: 'squirrel.girl@avengers.org',
    contactPhone: '(555) 123-9999',

    shippingName: 'Doreen Green',
    shippingCompanyName: 'Empire State University',
    shippingAddress1: 'Dorm Hall, Apt 5',
    shippingAddress2: '10 College Avenue',
    shippingCity: 'New York',
    shippingState: 'NY',
    shippingZip: '12345',

    cardholderName: 'Nancy Whitehead',
    cardLast4: '4040',
    cardToken: 'tok_12345',
    cardFunding: 'credit',

    billingAddressSameAsShippingAddress: false,

    billingAddress1: '3 Avengers Towers',
    billingAddress2: '',
    billingCity: 'New York',
    billingState: 'NY',
    billingZip: '12223',

    ...overrides,
  });
}

storiesOf('Common Components/Checkout/ReviewContent', module)
  .add('default', () => (
    <ReviewContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={makeOrder()}
      submit={action('submit') as any}
    />
  ))
  .add('cart has pending certs', () => (
    <ReviewContent
      certificateType="death"
      deathCertificateCart={makeCart([PENDING_CERTIFICATE])}
      order={makeOrder()}
      submit={action('submit') as any}
    />
  ))
  .add('empty cart', () => (
    <ReviewContent
      certificateType="death"
      deathCertificateCart={new Cart()}
      order={makeOrder()}
      submit={action('submit') as any}
    />
  ))
  .add('invalid order', () => (
    <ReviewContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={new Order()}
      submit={action('submit') as any}
    />
  ))
  .add('submitting', () => (
    <ReviewContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={(() => {
        const order = makeOrder();
        order.processing = true;

        return order;
      })()}
      submit={action('submit') as any}
      showErrorsForTest
    />
  ))
  .add('submission error', () => (
    <ReviewContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={makeOrder()}
      submit={action('submit') as any}
      testSubmissionError={
        new SubmissionError(
          'The order could not be processed.',
          OrderErrorCause.INTERNAL
        )
      }
    />
  ))
  .add('payment error', () => (
    <ReviewContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={makeOrder()}
      submit={action('submit') as any}
      testSubmissionError={
        new SubmissionError(
          "Your card's security code is incorrect.",
          OrderErrorCause.USER_PAYMENT
        )
      }
    />
  ))
  .add('birth certificate', () => (
    <ReviewContent
      certificateType="birth"
      birthCertificateRequest={makeBirthCertificateRequest()}
      order={makeOrder()}
      submit={action('submit') as any}
      progress={{
        currentStep: 8,
        totalSteps: 8,
        currentStepCompleted: false,
      }}
    />
  ))
  .add('marriage certificate', () => (
    <ReviewContent
      certificateType="marriage"
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      order={makeOrder()}
      submit={action('submit') as any}
      progress={{
        currentStep: 8,
        totalSteps: 8,
        currentStepCompleted: false,
      }}
    />
  ));
