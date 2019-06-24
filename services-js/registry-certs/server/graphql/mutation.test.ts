import { resolvers } from './mutation';
import RegistryDb from '../services/RegistryDb';
import {
  BirthCertificateOrderItemInput,
  DeathCertificateOrderItemInput,
} from '../../client/queries/graphql-types';

jest.mock('../services/RegistryDb');

const DEFAULT_ORDER = {
  contactName: 'Nancy Whitehead',
  contactEmail: 'nancy@mew.io',
  contactPhone: '(555) 123-4567',

  shippingName: 'Squirrel Girl',
  shippingCompanyName: 'Avengers Tower',
  shippingAddress1: '1 Avengers Pl.',
  shippingAddress2: '',
  shippingCity: 'New York',
  shippingState: 'NY',
  shippingZip: '10001',

  cardholderName: 'Doreen Green',
  cardToken: 'tok_test',
  cardLast4: '1234',

  billingAddress1: 'City University',
  billingAddress2: '',
  billingCity: 'New York',
  billingState: 'NY',
  billingZip: '10021',

  idempotencyKey: '1234abcd',
};

const DEFAULT_DEATH_ITEMS: Array<DeathCertificateOrderItemInput> = [
  {
    id: '12345',
    name: '',
    quantity: 10,
  },
];

const DEFAULT_BIRTH_ITEM: BirthCertificateOrderItemInput = {
  firstName: 'Danielle',
  lastName: 'Cage',
  alternateSpellings: '',
  birthDate: new Date('01 March 2006 00:00:00 GMT').toISOString(),
  parent1FirstName: 'Jessica',
  parent1LastName: 'Jones',
  parent2FirstName: 'Luke',
  parent2LastName: 'Cage',
  quantity: 10,
  uploadSessionId: '',
  requestDetails: 'parent',
};

describe('Mutation resolvers', () => {
  let registryDb: jest.Mocked<RegistryDb>;

  beforeEach(() => {
    registryDb = new RegistryDb(null as any) as any;
  });

  describe('submitDeathCertificateOrder', () => {
    it('throws if a validator fails', async () => {
      await expect(
        resolvers.Mutation.submitDeathCertificateOrder(
          {},
          {
            ...DEFAULT_ORDER,

            items: DEFAULT_DEATH_ITEMS,
            contactName: '',
          },
          {} as any
        )
      ).rejects.toMatchSnapshot();
    });

    it('throws if there are no items', async () => {
      await expect(
        resolvers.Mutation.submitDeathCertificateOrder(
          {},
          {
            ...DEFAULT_ORDER,
            items: [],
          },
          {} as any
        )
      ).rejects.toMatchSnapshot();
    });

    it('sends a charge to Stripe', async () => {
      const tokensRetrieve = jest.fn();
      const chargesCreate = jest.fn();

      const stripe: any = {
        charges: {
          create: chargesCreate,
        },
        tokens: {
          retrieve: tokensRetrieve,
        },
      };

      const emails = {
        sendReceiptEmail: jest.fn(),
      };

      registryDb.addOrder.mockReturnValue(Promise.resolve(25));

      tokensRetrieve.mockReturnValue(
        Promise.resolve({ card: { funding: 'credit' } })
      );
      chargesCreate.mockReturnValue(Promise.resolve({ id: 'ch_12345' }));

      await resolvers.Mutation.submitDeathCertificateOrder(
        {},
        { ...DEFAULT_ORDER, items: DEFAULT_DEATH_ITEMS },
        {
          stripe,
          registryDb,
          emails,
        } as any
      );

      expect(chargesCreate).toHaveBeenCalledWith({
        amount: 14326,
        currency: 'usd',
        source: 'tok_test',
        capture: true,
        description: 'Death certificates (Registry)',
        statement_descriptor: 'CITYBOSTON*REG + FEE',
        metadata: expect.objectContaining({
          'webapp.name': 'registry-certs',
          'webapp.nodeEnv': 'test',
          'order.orderId': expect.any(String),
          'order.orderKey': '25',
          'order.orderType': 'DC',
          'order.quantity': '10',
          'order.unitPrice': '1400',
        }),
      });
    });
  });

  describe('submitBirthCertificateOrder', () => {
    it('throws if a validator fails', async () => {
      await expect(
        resolvers.Mutation.submitBirthCertificateOrder(
          {},
          {
            ...DEFAULT_ORDER,
            item: DEFAULT_BIRTH_ITEM,
            contactName: '',
          },
          { registryDb } as any
        )
      ).rejects.toMatchSnapshot();
    });

    it('sends a charge to Stripe', async () => {
      const tokensRetrieve = jest.fn();
      const chargesCreate = jest.fn();

      const stripe: any = {
        charges: {
          create: chargesCreate,
        },
        tokens: {
          retrieve: tokensRetrieve,
        },
      };

      const emails = {
        sendReceiptEmail: jest.fn(),
      };

      registryDb.addOrder.mockReturnValue(Promise.resolve(25));

      tokensRetrieve.mockReturnValue(
        Promise.resolve({ card: { funding: 'credit' } })
      );
      chargesCreate.mockReturnValue(Promise.resolve({ id: 'ch_12345' }));

      await resolvers.Mutation.submitBirthCertificateOrder(
        {},
        {
          ...DEFAULT_ORDER,
          item: {
            firstName: 'Doreen',
            lastName: 'Green',
            alternateSpellings: 'Squirrel Girl',
            birthDate: new Date('1997-07-01T00:00:00Z').toISOString(),
            parent1FirstName: 'Maureen',
            parent1LastName: 'Green',
            parent2FirstName: 'Dor',
            parent2LastName: 'Green',
            quantity: 10,
            requestDetails: 'sidekick',
            uploadSessionId: '',
          },
        },

        {
          stripe,
          registryDb,
          emails,
        } as any
      );

      expect(chargesCreate).toHaveBeenCalledWith({
        amount: 14326,
        currency: 'usd',
        source: 'tok_test',
        capture: false,
        description: 'Birth certificates (Registry)',
        statement_descriptor: 'CITYBOSTON*REG + FEE',
        metadata: expect.objectContaining({
          'webapp.name': 'registry-certs',
          'webapp.nodeEnv': 'test',
          'order.orderId': expect.any(String),
          'order.orderKey': '25',
          'order.quantity': '10',
          'order.source': 'registry',
          'order.orderType': 'BC',
          'order.unitPrice': '1400',
        }),
      });
    });
  });
});
