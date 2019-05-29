import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Cart from '../../store/DeathCertificateCart';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import Order, { OrderInfo } from '../../models/Order';

import ShippingContent from './ShippingContent';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';
import { TYPICAL_REQUEST as marriageCertRequest } from '../../../fixtures/client/marriage-certificates';

function makeCart() {
  const cart = new Cart();

  cart.setQuantity(TYPICAL_CERTIFICATE, 1);
  cart.setQuantity(PENDING_CERTIFICATE, 3);
  cart.setQuantity(NO_DATE_CERTIFICATE, 1);

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

export function makeBirthCertificateRequest() {
  const request = new BirthCertificateRequest();

  request.quantity = 4;
  request.answerQuestion({
    firstName: 'Carol',
    lastName: 'Danvers',
    birthDate: new Date(1968, 2, 5),
  });

  return request;
}

export function makeMarriageCertificateRequest() {
  const request = new MarriageCertificateRequest();

  request.quantity = 1;

  request.answerQuestion(marriageCertRequest);

  return request;
}

storiesOf('Common Components/Checkout/ShippingContent', module)
  .add('default', () => (
    <ShippingContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={new Order()}
      submit={action('submit')}
    />
  ))
  .add('email error', () => (
    <ShippingContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={makeOrder({ contactEmail: 'notacompleteaddress@' })}
      submit={action('submit')}
    />
  ))
  .add('existing address', () => (
    <ShippingContent
      certificateType="death"
      deathCertificateCart={makeCart()}
      order={makeOrder()}
      submit={action('submit')}
    />
  ))
  .add('birth certificate', () => (
    <ShippingContent
      certificateType="birth"
      birthCertificateRequest={makeBirthCertificateRequest()}
      order={makeOrder()}
      submit={action('submit')}
      progress={{
        currentStep: 6,
        totalSteps: 8,
        currentStepCompleted: false,
      }}
    />
  ))
  .add('marriage certificate', () => (
    <ShippingContent
      certificateType="marriage"
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      order={makeOrder()}
      submit={action('submit')}
      progress={{
        currentStep: 6,
        totalSteps: 8,
        currentStepCompleted: false,
      }}
    />
  ));
