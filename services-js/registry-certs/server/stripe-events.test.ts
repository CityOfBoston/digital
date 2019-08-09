import CERTIFICATES from '../fixtures/registry-data/smith.json';
import BIRTH_CERTIFICATE_ORDER_DETAILS from '../fixtures/registry-orders/birth-certificate-request-details.json';
import MARRIAGE_CERTIFICATE_ORDER_DETAILS from '../fixtures/registry-orders/marriage-certificate-request-details.json';
import ORDER from '../fixtures/registry-orders/order.json';
import CHARGE_CAPTURED_BIRTH from '../fixtures/stripe/charge-captured-birth.json';
import CHARGE_CAPTURED_MARRIAGE from '../fixtures/stripe/charge-captured-marriage.json';
import CHARGE_SUCCEEDED from '../fixtures/stripe/charge-succeeded.json';
import CHARGE_UNCAPTURED_BIRTH from '../fixtures/stripe/charge-uncaptured-birth.json';
import CHARGE_UNCAPTURED_MARRIAGE from '../fixtures/stripe/charge-uncaptured-marriage.json';
import Emails from './services/Emails';
import {
  DeathCertificate,
  DeathCertificateSearchResult,
  FindBirthCertificateRequestResult,
  FindMarriageCertificateRequestResult,
  FindOrderResult,
} from './services/RegistryDb';
import RegistryDbFake from './services/RegistryDbFake';
import { processStripeEvent } from './stripe-events';

const DB_ORDER: FindOrderResult = {
  ...ORDER,
  OrderDate: new Date(ORDER.OrderDate),
};

const DB_BIRTH_CERTIFICATE_ORDER_DETAILS = {
  ...BIRTH_CERTIFICATE_ORDER_DETAILS,
  DateOfBirth: new Date(BIRTH_CERTIFICATE_ORDER_DETAILS.DateOfBirth),
};

const DB_MARRIAGE_CERTIFICATE_ORDER_DETAILS = {
  ...MARRIAGE_CERTIFICATE_ORDER_DETAILS,
  DateOfMarriageExact: new Date(
    MARRIAGE_CERTIFICATE_ORDER_DETAILS.DateOfMarriageExact
  ),
};

const emailMockFunctions = {
  sendDeathReceiptEmail: jest.fn(),
  sendBirthReceiptEmail: jest.fn(),
  sendMarriageReceiptEmail: jest.fn(),
  sendBirthShippedEmail: jest.fn(),
  sendMarriageShippedEmail: jest.fn(),
  sendBirthExpiredEmail: jest.fn(),
  sendMarriageExpiredEmail: jest.fn(),
};

describe('charge.created', () => {
  let emails: Required<Emails>;
  let stripe;
  let registryDb: RegistryDbFake;

  beforeEach(() => {
    emails = emailMockFunctions;
    stripe = {} as any;

    registryDb = new RegistryDbFake(
      CERTIFICATES as DeathCertificateSearchResult[]
    );

    jest
      .spyOn(registryDb, 'lookupDeathCertificate')
      .mockReturnValue(Promise.resolve<DeathCertificate>(CERTIFICATES[0]));
    jest
      .spyOn(registryDb, 'findOrder')
      .mockReturnValue(Promise.resolve(DB_ORDER));
    jest
      .spyOn(registryDb, 'lookupBirthCertificateOrderDetails')
      .mockReturnValue(
        Promise.resolve<FindBirthCertificateRequestResult>(
          DB_BIRTH_CERTIFICATE_ORDER_DETAILS
        )
      );
    jest
      .spyOn(registryDb, 'lookupMarriageCertificateOrderDetails')
      .mockReturnValue(
        Promise.resolve<FindMarriageCertificateRequestResult>(
          DB_MARRIAGE_CERTIFICATE_ORDER_DETAILS
        )
      );
    jest.spyOn(registryDb, 'addPayment');
  });

  it('adds uncaptured payments as well', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_UNCAPTURED_BIRTH)
    );

    expect(registryDb.addPayment).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      6920,
      2019-01-25T16:06:55.000Z,
      "ch_1DwXClHEIqCf0NlgypL8DXb6",
      14.56,
    ],
  ],
  "results": Array [
    Object {
      "type": "return",
      "value": Promise {},
    },
  ],
}
`);
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
      JSON.stringify(CHARGE_UNCAPTURED_BIRTH)
    );

    expect(emails.sendBirthReceiptEmail).toHaveBeenCalled();
    expect(emails.sendBirthReceiptEmail).toMatchSnapshot();
  });

  it('sends marriage email', async () => {
    (registryDb.findOrder as jest.Mock).mockReturnValue(
      Promise.resolve({
        ...ORDER,
        OrderType: 'MC',
        // These are null for marriage certs
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
      JSON.stringify(CHARGE_UNCAPTURED_MARRIAGE)
    );

    expect(emails.sendMarriageReceiptEmail).toHaveBeenCalled();
    expect(emails.sendMarriageReceiptEmail).toMatchSnapshot();
  });
});

describe('charge.captured', () => {
  let emails: Required<Emails>;
  let stripe;
  let registryDb: RegistryDbFake;

  beforeEach(() => {
    emails = emailMockFunctions;

    stripe = {} as any;

    registryDb = new RegistryDbFake(
      CERTIFICATES as DeathCertificateSearchResult[]
    );

    jest
      .spyOn(registryDb, 'findOrder')
      .mockReturnValue(Promise.resolve(DB_ORDER));
    jest
      .spyOn(registryDb, 'lookupBirthCertificateOrderDetails')
      .mockReturnValue(Promise.resolve(DB_BIRTH_CERTIFICATE_ORDER_DETAILS));
    jest
      .spyOn(registryDb, 'lookupMarriageCertificateOrderDetails')
      .mockReturnValue(Promise.resolve(DB_MARRIAGE_CERTIFICATE_ORDER_DETAILS));
    jest.spyOn(registryDb, 'addPayment').mockReturnValue(Promise.resolve());
  });

  it('sends a birth shipped email', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_CAPTURED_BIRTH)
    );

    expect(emails.sendBirthShippedEmail).toHaveBeenCalled();
    expect(emails.sendBirthShippedEmail).toMatchSnapshot();
  });

  it('sends a marriage shipped email', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify(CHARGE_CAPTURED_MARRIAGE)
    );

    expect(emails.sendMarriageShippedEmail).toHaveBeenCalled();
    expect(emails.sendMarriageShippedEmail).toMatchSnapshot();
  });
});

describe('charge.expired', () => {
  let emails: Required<Emails>;
  let stripe;
  let registryDb: RegistryDbFake;

  beforeEach(() => {
    emails = emailMockFunctions;

    stripe = {} as any;

    registryDb = new RegistryDbFake(
      CERTIFICATES as DeathCertificateSearchResult[]
    );

    jest
      .spyOn(registryDb, 'findOrder')
      .mockReturnValue(Promise.resolve(DB_ORDER));
  });

  it('sends a birth request expired email', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify({
        ...CHARGE_CAPTURED_BIRTH,
        type: 'charge.expired',
      })
    );

    expect(emails.sendBirthExpiredEmail).toHaveBeenCalled();
    expect(emails.sendBirthExpiredEmail).toMatchSnapshot();
  });

  it('sends a marriage request expired email', async () => {
    await processStripeEvent(
      {
        emails: emails as any,
        stripe,
        registryDb: registryDb as any,
      },
      '',
      '',
      JSON.stringify({
        ...CHARGE_CAPTURED_MARRIAGE,
        type: 'charge.expired',
      })
    );

    expect(emails.sendMarriageExpiredEmail).toHaveBeenCalled();
    expect(emails.sendMarriageExpiredEmail).toMatchSnapshot();
  });
});
