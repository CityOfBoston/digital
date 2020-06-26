import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import CheckoutDao from '../dao/CheckoutDao';
import Order, { OrderInfo } from '../models/Order';
import OrderProvider from '../store/OrderProvider';
import MarriageIntentionCertificateRequest from '../store/MarriageIntentionCertificateRequest';

import CheckoutPage from './CheckoutPage';

import { TYPICAL_REQUEST as birthCertRequest } from '../../fixtures/client/birth-certificates';

const makeStripe = () =>
  typeof Stripe !== 'undefined' ? Stripe('fake-secret-key') : null;

function makeMarriageIntentionCertificateRequest() {
  const request = new MarriageIntentionCertificateRequest();

  request.quantity = 4;

  request.answerQuestion(birthCertRequest);

  return request;
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

storiesOf('Birth/CheckoutPage', module)
  .add('server-side render', () => (
    <CheckoutPage
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      info={{ page: 'shipping' }}
      siteAnalytics={new GaSiteAnalytics()}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      // This never resolves, so we just get the initial render.
      orderProvider={{ get: () => new Promise(() => {}) } as any}
    />
  ))
  .add('no birth certificate request', () => (
    <CheckoutPage
      marriageIntentionCertificateRequest={
        new MarriageIntentionCertificateRequest()
      }
      info={{ page: 'shipping' }}
      siteAnalytics={new GaSiteAnalytics()}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      // This never resolves, so we just get the initial render.
      orderProvider={new OrderProvider()}
      orderForTest={new Order()}
    />
  ))
  .add('shipping', () => (
    <CheckoutPage
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      info={{ page: 'shipping' }}
      siteAnalytics={new GaSiteAnalytics()}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={new Order()}
    />
  ))
  .add('payment', () => (
    <CheckoutPage
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      info={{ page: 'payment' }}
      siteAnalytics={new GaSiteAnalytics()}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={makeShippingCompleteOrder()}
    />
  ))
  .add('review', () => (
    <CheckoutPage
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      info={{ page: 'review' }}
      siteAnalytics={new GaSiteAnalytics()}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={makeBillingCompleteOrder()}
    />
  ))
  .add('confirmation', () => (
    <CheckoutPage
      marriageIntentionCertificateRequest={
        new MarriageIntentionCertificateRequest()
      }
      info={{
        page: 'confirmation',
        stepCount: 8,
        orderId: 'RG-BC201901-414211',
        contactEmail: 'ttoe@squirrelzone.net',
      }}
      siteAnalytics={new GaSiteAnalytics()}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={new Order()}
    />
  ));
