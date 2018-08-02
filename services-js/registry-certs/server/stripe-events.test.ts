import { processStripeEvent } from './stripe-events';

import RegistryData from './services/RegistryData';
import RegistryOrders from './services/RegistryOrders';

import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded.json';
import ORDER from '../fixtures/registry-orders/order.json';
import CERTIFICATES from '../fixtures/registry-data/smith.json';

describe('charge.created', () => {
  let emails;
  let stripe;
  let registryData: RegistryData;
  let registryOrders: RegistryOrders;

  beforeEach(() => {
    emails = {
      sendReceiptEmail: jest.fn(),
    } as any;
    stripe = {} as any;
    registryData = {
      lookup: () => CERTIFICATES[0],
    } as any;
    registryOrders = {
      findOrder: () => ORDER,
      addPayment: jest.fn(),
    } as any;
  });

  it('marks the order as paid', async () => {
    await processStripeEvent(
      {
        emails,
        stripe,
        registryData,
        registryOrders,
      },
      null,
      '',
      JSON.stringify(CHARGE_SUCCEEDED)
    );

    expect(registryOrders.addPayment).toHaveBeenCalledWith(
      19, // the order key from the charge as an int
      expect.anything(),
      expect.anything(),
      14.56 // the charge amount in a float, rather than Stripe's cents
    );
  });

  it('sends email', async () => {
    await processStripeEvent(
      {
        emails,
        stripe,
        registryData,
        registryOrders,
      },
      null,
      '',
      JSON.stringify(CHARGE_SUCCEEDED)
    );

    expect(emails.sendReceiptEmail).toHaveBeenCalledWith(
      'Nancy Whitehead',
      'nancy@mew.org',
      // we're letting the type checking ensure that all this data is complete.
      expect.anything()
    );
  });
});
