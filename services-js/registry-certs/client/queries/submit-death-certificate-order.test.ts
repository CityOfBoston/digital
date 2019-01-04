import Cart from '../store/DeathCertificateCart';
import Order from '../models/Order';

import { TYPICAL_CERTIFICATE } from '../../fixtures/client/death-certificates';

import { SubmitDeathCertificateOrderVariables } from './graphql-types';

import submitDeathCertificateOrder from './submit-death-certificate-order';

test('submitDeathCertificateOrder', async () => {
  const fetchGraphql: any = jest.fn().mockReturnValue({
    submitDeathCertificateOrder: {
      id: 'test-id',
    },
  });

  const cart = new Cart();
  cart.setQuantity(TYPICAL_CERTIFICATE, 10);

  const order = new Order();

  order.info = {
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
    cardToken: 'tok_testtoken',
    cardFunding: 'credit',

    billingAddressSameAsShippingAddress: false,

    billingAddress1: '3 Avengers Towers',
    billingAddress2: '',
    billingCity: 'New York',
    billingState: 'NY',
    billingZip: '12223',
  };

  order.idempotencyKey = '1234abcd';

  await submitDeathCertificateOrder(fetchGraphql, cart, order);

  const queryVariables: SubmitDeathCertificateOrderVariables = {
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
    cardToken: 'tok_testtoken',
    cardLast4: '4040',

    billingAddress1: '3 Avengers Towers',
    billingAddress2: '',
    billingCity: 'New York',
    billingState: 'NY',
    billingZip: '12223',

    items: [
      {
        id: '000002',
        name: 'BRUCE BANNER',
        quantity: 10,
      },
    ],

    idempotencyKey: '1234abcd',
  };

  expect(fetchGraphql).toHaveBeenCalledWith(expect.any(String), queryVariables);
});
