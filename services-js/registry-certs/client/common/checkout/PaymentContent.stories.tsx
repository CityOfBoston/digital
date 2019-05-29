/* global Stripe */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Cart from '../../store/DeathCertificateCart';

import Order, { OrderInfo } from '../../models/Order';

import PaymentContent from './PaymentContent';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

import {
  makeBirthCertificateRequest,
  makeMarriageCertificateRequest,
} from './ShippingContent.stories';

const makeStripe = () =>
  typeof Stripe !== 'undefined' ? Stripe('fake-secret-key') : null;

function makeCart() {
  const cart = new Cart();

  cart.setQuantity(TYPICAL_CERTIFICATE, 1);
  cart.setQuantity(PENDING_CERTIFICATE, 3);
  cart.setQuantity(NO_DATE_CERTIFICATE, 1);

  return cart;
}

function makeShippingCompleteOrder(overrides: Partial<OrderInfo> = {}) {
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
    cardLast4: '',
    cardToken: null,
    cardFunding: 'unknown',

    billingAddressSameAsShippingAddress: true,

    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',

    ...overrides,
  });
}

function makeBillingCompleteOrder(overrides = {}) {
  return makeShippingCompleteOrder({
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

storiesOf('Common Components/Checkout/PaymentContent', module)
  .add('default', () => (
    <PaymentContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      stripe={makeStripe()}
      order={makeShippingCompleteOrder()}
      submit={action('submit')}
    />
  ))
  .add('credit card error', () => (
    <PaymentContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      stripe={makeStripe()}
      order={makeShippingCompleteOrder()}
      submit={action('submit')}
      cardElementErrorForTest="Your card number is incomplete."
    />
  ))
  .add('ZIP code error', () => (
    <PaymentContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      stripe={makeStripe()}
      order={makeBillingCompleteOrder({
        billingZip: 'abc123',
        billingAddressSameAsShippingAddress: false,
      })}
      submit={action('submit')}
    />
  ))
  .add('Stripe error', () => (
    <PaymentContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      stripe={makeStripe()}
      order={makeBillingCompleteOrder()}
      submit={action('submit')}
      tokenizationErrorForTest="The card could not be tokenized"
    />
  ))
  .add('existing billing', () => (
    <PaymentContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      stripe={makeStripe()}
      order={makeBillingCompleteOrder()}
      submit={action('submit')}
    />
  ))
  .add('birth certificate', () => (
    <PaymentContent
      certificateType="birth"
      birthCertificateRequest={makeBirthCertificateRequest()}
      stripe={makeStripe()}
      order={makeBillingCompleteOrder()}
      submit={action('submit')}
      progress={{
        currentStep: 7,
        totalSteps: 8,
        currentStepCompleted: false,
      }}
    />
  ))
  .add('marriage certificate', () => (
    <PaymentContent
      certificateType="marriage"
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      stripe={makeStripe()}
      order={makeBillingCompleteOrder()}
      submit={action('submit')}
      progress={{
        currentStep: 7,
        totalSteps: 8,
        currentStepCompleted: false,
      }}
    />
  ));
