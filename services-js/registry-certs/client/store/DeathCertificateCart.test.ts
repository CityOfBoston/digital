import { GaSiteAnalytics } from '@cityofboston/next-client-common';
import DeathCertificateCart from './DeathCertificateCart';
import UploadableFile from '../models/UploadableFile';

jest.mock('../dao/DeathCertificatesDao');
const DeathCertificatesDao = require('../dao/DeathCertificatesDao').default;

const CERT_1: any = {
  id: '00001',
  pending: false,
};

const CERT_2: any = {
  id: '00002',
  pending: true,
};

describe('setQuantity', () => {
  let cart;

  beforeEach(() => {
    cart = new DeathCertificateCart();
    cart.setQuantity(CERT_1, 1);
  });

  it('it changes the quantity', () => {
    expect(cart.size).toEqual(1);
    cart.setQuantity(CERT_1, 5);
    expect(cart.size).toEqual(5);
  });

  it('keeps an entry with quantity 0', () => {
    expect(cart.size).toEqual(1);
    cart.setQuantity(CERT_1, 0);
    expect(cart.size).toEqual(0);
    expect(cart.entries.length).toEqual(1);
  });
});

describe('clean', () => {
  let cart;

  beforeEach(() => {
    cart = new DeathCertificateCart();
    cart.setQuantity(CERT_1, 0);
    cart.setQuantity(CERT_2, 5);
  });

  it('removes certs with 0', () => {
    expect(cart.size).toEqual(5);
    expect(cart.entries.length).toEqual(2);
    cart.clean();
    expect(cart.size).toEqual(5);
    expect(cart.entries.length).toEqual(1);
  });
});

describe('remove', () => {
  let cart;

  beforeEach(() => {
    cart = new DeathCertificateCart();
    cart.setQuantity(CERT_1, 1);
  });

  it('removes an item from the cart', () => {
    expect(cart.size).toEqual(1);
    cart.remove(CERT_1.id);
    expect(cart.size).toEqual(0);
    expect(cart.entries.length).toEqual(0);
  });

  it('is a no-op when the id isn’t found', () => {
    expect(cart.size).toEqual(1);
    cart.remove(CERT_2.id);
    expect(cart.size).toEqual(1);
    expect(cart.entries.length).toEqual(1);
  });
});

describe('contains pending', () => {
  let cart;

  beforeEach(() => {
    cart = new DeathCertificateCart();
    cart.setQuantity(CERT_1, 1);
  });

  it('is false if there are no pending certificates', () => {
    expect(cart.containsPending).toEqual(false);
  });

  it('is true if there are pending certificates', () => {
    cart.setQuantity(CERT_2, 5);
    expect(cart.containsPending).toEqual(true);
  });
});

describe('attach', () => {
  let resolveGraphqls;
  let localStorage: any;
  let deathCertificatesDao;
  let siteAnalytics;
  let cart: DeathCertificateCart;

  beforeEach(() => {
    localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    deathCertificatesDao = new DeathCertificatesDao(jest.fn());
    siteAnalytics = new GaSiteAnalytics();

    resolveGraphqls = [];

    deathCertificatesDao.get.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveGraphqls.push(resolve);
        })
    );

    cart = new DeathCertificateCart();
  });

  afterEach(() => {
    cart.detach();
  });

  it('hydrates entries from local storage', async () => {
    localStorage.getItem.mockReturnValue(
      JSON.stringify([
        { id: '00001', quantity: 4 },
        { id: '00002', quantity: 1 },
      ])
    );

    cart.attach(localStorage, deathCertificatesDao, siteAnalytics);

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('00001');
    expect(deathCertificatesDao.get).toHaveBeenCalledWith('00002');

    expect(cart.loading).toEqual(true);

    const item1 = cart.entries[0];
    const item2 = cart.entries[1];

    expect(item1.id).toEqual('00001');
    expect(item1.cert).toEqual(null);
    expect(item1.quantity).toEqual(4);
    expect(item2.id).toEqual('00002');
    expect(item2.cert).toEqual(null);
    expect(item2.quantity).toEqual(1);

    await resolveGraphqls[0](CERT_1);
    expect(cart.loading).toEqual(true);

    await resolveGraphqls[1](CERT_2);
    expect(cart.loading).toEqual(false);

    expect(item1.cert).toEqual(CERT_1);
    expect(item2.cert).toEqual(CERT_2);
  });

  it('updates local storage with new values', async () => {
    cart.attach(localStorage, deathCertificatesDao, siteAnalytics);

    cart.setQuantity(CERT_1, 5);

    expect(localStorage.setItem).toHaveBeenCalledWith('cart', expect.any(String));
    expect(JSON.parse(lastSavedCart())).toEqual([
      {
        id: CERT_1.id,
        quantity: 5,
        // STEP 3 options ride along with the line item so a reloaded cart keeps
        // its SSN answer and its attachment upload session.
        includeSsn: null,
        relationship: '',
        identityDocumentType: '',
        identityAlternateDocumentType1: '',
        identityAlternateDocumentType2: '',
        uploadSessionId: expect.any(String),
        relationshipDocuments: [],
        identityDocuments: [],
        identityDocumentsSecondary: [],
      },
    ]);
  });

  it('round-trips certificate options through local storage', async () => {
    cart.attach(localStorage, deathCertificatesDao, siteAnalytics);

    const relationshipDoc = UploadableFile.fromRecord(
      { attachmentKey: '11', name: 'marriage.pdf' },
      'session-1',
      'relationship:Spouse/Domestic Partner'
    );
    const identityDoc = UploadableFile.fromRecord(
      { attachmentKey: '22', name: 'passport.jpg' },
      'session-1',
      'identity:Passport'
    );

    cart.setCertificateOptions(CERT_1, 2, {
      includeSsn: true,
      relationship: 'spouse',
      identityDocumentType: 'passport',
      identityAlternateDocumentType1: '',
      identityAlternateDocumentType2: '',
      uploadSessionId: 'session-1',
      relationshipDocuments: [relationshipDoc],
      identityDocuments: [identityDoc],
      identityDocumentsSecondary: [],
    });

    const saved = JSON.parse(lastSavedCart());

    expect(saved).toEqual([
      {
        id: CERT_1.id,
        quantity: 2,
        includeSsn: true,
        relationship: 'spouse',
        identityDocumentType: 'passport',
        identityAlternateDocumentType1: '',
        identityAlternateDocumentType2: '',
        uploadSessionId: 'session-1',
        relationshipDocuments: [
          { attachmentKey: '11', name: 'marriage.pdf' },
        ],
        identityDocuments: [{ attachmentKey: '22', name: 'passport.jpg' }],
        identityDocumentsSecondary: [],
      },
    ]);

    const rehydrated = new DeathCertificateCart();
    localStorage.getItem.mockReturnValue(JSON.stringify(saved));
    rehydrated.attach(localStorage, deathCertificatesDao, siteAnalytics);

    expect(rehydrated.entries[0]).toMatchObject({
      id: CERT_1.id,
      quantity: 2,
      includeSsn: true,
      relationship: 'spouse',
      identityDocumentType: 'passport',
      uploadSessionId: 'session-1',
    });
    expect(rehydrated.entries[0].relationshipDocuments[0].name).toBe(
      'marriage.pdf'
    );
    expect(rehydrated.entries[0].identityDocuments[0].name).toBe(
      'passport.jpg'
    );

    // Autorun rewrite must not wipe the restored filenames.
    expect(JSON.parse(lastSavedCart())[0].relationshipDocuments[0].name).toBe(
      'marriage.pdf'
    );

    rehydrated.detach();
  });

  it('round-trips Other identity selections and secondary uploads', async () => {
    cart.attach(localStorage, deathCertificatesDao, siteAnalytics);

    const relationshipDoc = UploadableFile.fromRecord(
      { attachmentKey: '11', name: 'marriage.pdf' },
      'session-other',
      'relationship:Spouse/Domestic Partner'
    );
    const firstIdentity = UploadableFile.fromRecord(
      { attachmentKey: '22', name: 'utility.pdf' },
      'session-other',
      'identity:2 Consecutive Utility Bills'
    );
    const secondIdentity = UploadableFile.fromRecord(
      { attachmentKey: '33', name: 'ssn.pdf' },
      'session-other',
      'identity:Social Security Card'
    );

    cart.setCertificateOptions(CERT_1, 1, {
      includeSsn: true,
      relationship: 'spouse',
      identityDocumentType: 'other',
      identityAlternateDocumentType1: 'utility-bills',
      identityAlternateDocumentType2: 'social-security-card',
      uploadSessionId: 'session-other',
      relationshipDocuments: [relationshipDoc],
      identityDocuments: [firstIdentity],
      identityDocumentsSecondary: [secondIdentity],
    });

    const saved = JSON.parse(lastSavedCart())[0];

    expect(saved.identityDocumentType).toBe('other');
    expect(saved.identityAlternateDocumentType1).toBe('utility-bills');
    expect(saved.identityAlternateDocumentType2).toBe('social-security-card');
    expect(saved.identityDocuments).toEqual([
      { attachmentKey: '22', name: 'utility.pdf' },
    ]);
    expect(saved.identityDocumentsSecondary).toEqual([
      { attachmentKey: '33', name: 'ssn.pdf' },
    ]);

    const rehydrated = new DeathCertificateCart();
    localStorage.getItem.mockReturnValue(JSON.stringify([saved]));
    rehydrated.attach(localStorage, deathCertificatesDao, siteAnalytics);

    expect(rehydrated.entries[0]).toMatchObject({
      identityDocumentType: 'other',
      identityAlternateDocumentType1: 'utility-bills',
      identityAlternateDocumentType2: 'social-security-card',
    });
    expect(rehydrated.entries[0].identityDocuments[0].name).toBe(
      'utility.pdf'
    );
    expect(rehydrated.entries[0].identityDocumentsSecondary[0].name).toBe(
      'ssn.pdf'
    );

    rehydrated.detach();
  });

  it('encodes preferred and alternate identity attachment labels', () => {
    const {
      deathIdentityAttachmentLabel,
      deathRelationshipAttachmentLabel,
      deathIdentitySupportingDocumentsComplete,
    } = require('./DeathCertificateCart');

    expect(deathIdentityAttachmentLabel('drivers-license')).toBe(
      "identity:Driver's License"
    );
    expect(deathIdentityAttachmentLabel('utility-bills')).toBe(
      'identity:2 Consecutive Utility Bills'
    );
    expect(deathIdentityAttachmentLabel('pay-stub')).toBe(
      'identity:1 Pay Stub'
    );
    expect(deathRelationshipAttachmentLabel('spouse')).toBe(
      'relationship:Spouse/Domestic Partner'
    );

    expect(
      deathIdentitySupportingDocumentsComplete({
        identityDocumentType: 'other',
        identityAlternateDocumentType1: 'utility-bills',
        identityAlternateDocumentType2: 'utility-bills',
        identityDocuments: [{ status: 'success' }],
        identityDocumentsSecondary: [{ status: 'success' }],
      })
    ).toBe(false);

    expect(
      deathIdentitySupportingDocumentsComplete({
        identityDocumentType: 'other',
        identityAlternateDocumentType1: 'utility-bills',
        identityAlternateDocumentType2: 'pay-stub',
        identityDocuments: [{ status: 'success' }],
        identityDocumentsSecondary: [{ status: 'success' }],
      })
    ).toBe(true);
  });

  function lastSavedCart(): string {
    const { calls } = localStorage.setItem.mock;
    return calls[calls.length - 1][1];
  }
});
