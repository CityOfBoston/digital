import { processStripeEvent } from './stripe-events';

import { DeathCertificateSearchResult } from './services/RegistryDb';

import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded.json';
import CHARGE_UNCAPTURED from '../fixtures/stripe/charge-uncaptured.json';
import ORDER from '../fixtures/registry-orders/order.json';
import BIRTH_CERTIFICATE_ORDER_DETAILS from '../fixtures/registry-orders/birth-certificate-request-details.json';
import CERTIFICATES from '../fixtures/registry-data/smith.json';
import RegistryDbFake from './services/RegistryDbFake';
import Emails from './services/Emails';

describe('charge.created', () => {
  let emails: Required<Emails>;
  let stripe;
  let registryDb: RegistryDbFake;

  beforeEach(() => {
    emails = {
      sendReceiptEmail: jest.fn(),
    };
    stripe = {} as any;

    registryDb = new RegistryDbFake(
      CERTIFICATES as DeathCertificateSearchResult[]
    );

    jest
      .spyOn(registryDb, 'lookupDeathCertificate')
      .mockReturnValue(Promise.resolve(CERTIFICATES[0]));
    jest.spyOn(registryDb, 'findOrder').mockReturnValue(Promise.resolve(ORDER));
    jest
      .spyOn(registryDb, 'lookupBirthCertificateOrderDetails')
      .mockReturnValue(Promise.resolve(BIRTH_CERTIFICATE_ORDER_DETAILS));
    jest.spyOn(registryDb, 'addPayment');
  });

  it('doesn’t add uncaptured payments', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_UNCAPTURED)
    );

    expect(registryDb.addPayment).not.toHaveBeenCalled();
  });

  it('marks the order as paid', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
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

  it('sends death email', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_SUCCEEDED)
    );

    expect(emails.sendReceiptEmail).toHaveBeenCalled();
    expect(emails.sendReceiptEmail).toMatchSnapshot();
  });

  it('sends birth email', async () => {
    (registryDb.findOrder as jest.Mock).mockReturnValue(
      Promise.resolve({
        ...ORDER,
        OrderType: 'BC',
        // These are null for birth certs
        CertificateCost: null,
        TotalCost: null,
      })
    );

    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_UNCAPTURED)
    );

    expect(emails.sendReceiptEmail).toHaveBeenCalled();
    expect(emails.sendReceiptEmail).toMatchSnapshot();
  });
});
