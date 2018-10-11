import { processStripeEvent } from './stripe-events';

import RegistryDb from './services/RegistryDb';

import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded.json';
import ORDER from '../fixtures/registry-orders/order.json';
import CERTIFICATES from '../fixtures/registry-data/smith.json';

describe('charge.created', () => {
  let emails;
  let stripe;
  let registryDb: RegistryDb;

  beforeEach(() => {
    emails = {
      sendReceiptEmail: jest.fn(),
    } as any;
    stripe = {} as any;
    registryDb = {
      lookup: () => CERTIFICATES[0],
      findOrder: () => ORDER,
      addPayment: jest.fn(),
    } as any;
  });

  it('marks the order as paid', async () => {
    await processStripeEvent(
      {
        emails,
        stripe,
        registryDb,
      },
      '',
      '',
      JSON.stringify(CHARGE_SUCCEEDED)
    );

    expect(registryDb.addPayment).toHaveBeenCalledWith(
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
        registryDb,
      },
      '',
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
