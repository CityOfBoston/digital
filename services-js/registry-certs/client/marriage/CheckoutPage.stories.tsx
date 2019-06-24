import React from 'react';
import { storiesOf } from '@storybook/react';

import CheckoutDao from '../dao/CheckoutDao';
import Order, { OrderInfo } from '../models/Order';
import OrderProvider from '../store/OrderProvider';
import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

import { TYPICAL_REQUEST as marriageCertRequest } from '../../fixtures/client/marriage-certificates';

import CheckoutPage from './CheckoutPage';

const makeStripe = () =>
  typeof Stripe !== 'undefined' ? Stripe('fake-secret-key') : null;

function makeMarriageCertificateRequest() {
  const request = new MarriageCertificateRequest();

  request.quantity = 1;

  request.answerQuestion(marriageCertRequest);

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

storiesOf('Marriage/CheckoutPage', module)
  .add('server-side render', () => (
    <CheckoutPage
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      info={{ page: 'shipping' }}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      // This never resolves, so we just get the initial render.
      orderProvider={{ get: () => new Promise(() => {}) } as any}
    />
  ))
  .add('no marriage certificate request', () => (
    <CheckoutPage
      marriageCertificateRequest={new MarriageCertificateRequest()}
      info={{ page: 'shipping' }}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      // This never resolves, so we just get the initial render.
      orderProvider={new OrderProvider()}
      orderForTest={new Order()}
    />
  ))
  .add('shipping', () => (
    <CheckoutPage
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      info={{ page: 'shipping' }}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={new Order()}
    />
  ))
  .add('payment', () => (
    <CheckoutPage
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      info={{ page: 'payment' }}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={makeShippingCompleteOrder()}
    />
  ))
  .add('review', () => (
    <CheckoutPage
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      info={{ page: 'review' }}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={makeBillingCompleteOrder()}
    />
  ))
  .add('confirmation', () => (
    <CheckoutPage
      marriageCertificateRequest={new MarriageCertificateRequest()}
      info={{
        page: 'confirmation',
        stepCount: 8,
        orderId: 'RG-BC201901-414211',
        contactEmail: 'ttoe@squirrelzone.net',
      }}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={makeStripe()}
      orderProvider={new OrderProvider()}
      orderForTest={new Order()}
    />
  ));
