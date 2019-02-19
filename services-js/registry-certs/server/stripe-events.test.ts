import { processStripeEvent } from './stripe-events';

import { DeathCertificateSearchResult } from './services/RegistryDb';

import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded.json';
import CHARGE_UNCAPTURED from '../fixtures/stripe/charge-uncaptured.json';
import CHARGE_CAPTURED from '../fixtures/stripe/charge-captured.json';
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
      sendDeathReceiptEmail: jest.fn(),
      sendBirthReceiptEmail: jest.fn(),
      sendBirthShippedEmail: jest.fn(),
      sendBirthExpiredEmail: jest.fn(),
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

    expect(emails.sendDeathReceiptEmail).toHaveBeenCalled();
    expect(emails.sendDeathReceiptEmail).toMatchSnapshot();
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

    expect(emails.sendBirthReceiptEmail).toHaveBeenCalled();
    expect(emails.sendBirthReceiptEmail).toMatchSnapshot();
  });
});

describe('charge.captured', () => {
  let emails: Required<Emails>;
  let stripe;
  let registryDb: RegistryDbFake;

  beforeEach(() => {
    emails = {
      sendDeathReceiptEmail: jest.fn(),
      sendBirthReceiptEmail: jest.fn(),
      sendBirthShippedEmail: jest.fn(),
      sendBirthExpiredEmail: jest.fn(),
    };

    stripe = {} as any;

    registryDb = new RegistryDbFake(
      CERTIFICATES as DeathCertificateSearchResult[]
    );

    jest.spyOn(registryDb, 'findOrder').mockReturnValue(Promise.resolve(ORDER));
    jest
      .spyOn(registryDb, 'lookupBirthCertificateOrderDetails')
      .mockReturnValue(Promise.resolve(BIRTH_CERTIFICATE_ORDER_DETAILS));
    jest.spyOn(registryDb, 'addPayment').mockReturnValue(Promise.resolve());
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
      JSON.stringify(CHARGE_CAPTURED)
    );

    expect(registryDb.addPayment).toHaveBeenCalled();
    expect(registryDb.addPayment).toMatchSnapshot();
  });

  it('sends a shipped email', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_CAPTURED)
    );

    expect(emails.sendBirthShippedEmail).toHaveBeenCalled();
    expect(emails.sendBirthShippedEmail).toMatchSnapshot();
  });
});

describe('charge.expired', () => {
  let emails: Required<Emails>;
  let stripe;
  let registryDb: RegistryDbFake;

  beforeEach(() => {
    emails = {
      sendDeathReceiptEmail: jest.fn(),
      sendBirthReceiptEmail: jest.fn(),
      sendBirthShippedEmail: jest.fn(),
      sendBirthExpiredEmail: jest.fn(),
    };

    stripe = {} as any;

    registryDb = new RegistryDbFake(
      CERTIFICATES as DeathCertificateSearchResult[]
    );

    jest.spyOn(registryDb, 'findOrder').mockReturnValue(Promise.resolve(ORDER));
  });

  it('sends an expired email', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify({
        ...CHARGE_CAPTURED,
        type: 'charge.expired',
      })
    );

    expect(emails.sendBirthExpiredEmail).toHaveBeenCalled();
    expect(emails.sendBirthExpiredEmail).toMatchSnapshot();
  });
});
