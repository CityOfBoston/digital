import { processStripeEvent } from './stripe-events';

import { DeathCertificateSearchResult } from './services/RegistryDb';

import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded.json';
import CHARGE_UNCAPTURED from '../fixtures/stripe/charge-uncaptured.json';
import ORDER from '../fixtures/registry-orders/order.json';
import CERTIFICATES from '../fixtures/registry-data/smith.json';
import RegistryDbFake from './services/RegistryDbFake';

describe('charge.created', () => {
  let emails;
  let stripe;
  let registryDb: RegistryDbFake;

  beforeEach(() => {
    emails = {
      sendReceiptEmail: jest.fn(),
    } as any;
    stripe = {} as any;

    registryDb = new RegistryDbFake(
      CERTIFICATES as DeathCertificateSearchResult[]
    );

    jest
      .spyOn(registryDb, 'lookupDeathCertificate')
      .mockReturnValue(Promise.resolve(CERTIFICATES[0]));
    jest.spyOn(registryDb, 'findOrder').mockReturnValue(Promise.resolve(ORDER));
    jest.spyOn(registryDb, 'addPayment');
  });

  it('ignores uncaptured charges', async () => {
    await processStripeEvent(
      {
        emails,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_UNCAPTURED)
    );

    expect(registryDb.addPayment).not.toHaveBeenCalled();
    expect(emails.sendReceiptEmail).not.toHaveBeenCalled();
  });

  it('marks the order as paid', async () => {
    await processStripeEvent(
      {
        emails,
        stripe,
        registryDb: registryDb as any,
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
        registryDb: registryDb as any,
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
