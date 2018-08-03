import { resolvers } from './mutation';

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

  items: [
    {
      id: '12345',
      name: '',
      quantity: 10,
    },
  ],

  idempotencyKey: '1234abcd',
};

describe('Mutation resolvers', () => {
  describe('submitDeathCertificateOrder', () => {
    it('throws if a validator fails', async () => {
      await expect(
        resolvers.Mutation.submitDeathCertificateOrder(
          null,
          {
            ...DEFAULT_ORDER,
            contactName: '',
          },
          {} as any
        )
      ).rejects.toMatchSnapshot();
    });

    it('throws if there are no items', async () => {
      await expect(
        resolvers.Mutation.submitDeathCertificateOrder(
          null,
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

      const registryOrders = {
        addOrder: jest.fn(),
        addItem: jest.fn(),
        addPayment: jest.fn(),
      };

      const emails = {
        sendReceiptEmail: jest.fn(),
      };

      registryOrders.addOrder.mockReturnValue(Promise.resolve(25));

      tokensRetrieve.mockReturnValue(
        Promise.resolve({ card: { funding: 'credit' } })
      );
      chargesCreate.mockReturnValue(Promise.resolve({ id: 'ch_12345' }));

      await resolvers.Mutation.submitDeathCertificateOrder(
        null,
        DEFAULT_ORDER,
        { stripe, registryOrders, emails } as any
      );

      expect(chargesCreate).toHaveBeenCalledWith({
        amount: 14326,
        currency: 'usd',
        source: 'tok_test',
        description: 'Death certificates (Registry)',
        statement_descriptor: 'CITYBOSTON*REG + FEE',
        metadata: expect.objectContaining({
          'webapp.name': 'registry-certs',
          'webapp.nodeEnv': 'test',
          'order.orderId': expect.any(String),
          'order.orderKey': '25',
          'order.quantity': '10',
          'order.unitPrice': '1400',
        }),
      });
    });
  });
});
