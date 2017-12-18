// @flow

import { resolvers } from './mutation';

const DEFAULT_ORDER = {
  contactName: '',
  contactEmail: '',
  contactPhone: '',

  shippingName: '',
  shippingCompanyName: '',
  shippingAddress1: '',
  shippingAddress2: '',
  shippingCity: '',
  shippingState: '',
  shippingZip: '',

  cardholderName: '',
  cardToken: 'tok_test',
  cardLast4: '1234',

  billingAddress1: '',
  billingAddress2: '',
  billingCity: '',
  billingState: '',
  billingZip: '',

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
    it('throws if there are no items', async () => {
      await expect(
        resolvers.Mutation.submitDeathCertificateOrder(
          null,
          {
            ...DEFAULT_ORDER,
            items: [],
          },
          ({}: any)
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

      registryOrders.addOrder.mockReturnValue(Promise.resolve(25));

      tokensRetrieve.mockReturnValue(
        Promise.resolve({ card: { funding: 'credit' } })
      );
      chargesCreate.mockReturnValue(Promise.resolve({ id: 'ch_12345' }));

      await resolvers.Mutation.submitDeathCertificateOrder(
        null,
        DEFAULT_ORDER,
        ({ stripe, registryOrders }: any)
      );

      expect(chargesCreate).toHaveBeenCalledWith({
        amount: 14326,
        currency: 'usd',
        source: 'tok_test',
        description: 'Death certificates (Registry)',
        metadata: expect.objectContaining({
          'order.orderId': expect.any(String),
          'order.orderKey': '25',
          'order.quantity': '10',
          'order.unitPrice': '1400',
        }),
      });
    });
  });
});
