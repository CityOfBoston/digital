// @flow

import type { Context } from '.';

import { calculateCost } from '../../lib/costs';

export const Schema = `
input CertificateOrderItem {
  id: String!
  name: String!
  quantity: Int!
}

type SubmittedOrder {
  id: String!
}

type Mutation {
  submitDeathCertificateOrder (
    contactName: String!
    contactEmail: String!
    contactPhone: String!

    shippingName: String!
    shippingCompanyName: String
    shippingAddress1: String!
    shippingAddress2: String
    shippingCity: String!
    shippingState: String!
    shippingZip: String!

    cardToken: String!
    cardLast4: String!

    cardholderName: String!
    billingAddress1: String!
    billingAddress2: String
    billingCity: String!
    billingState: String!
    billingZip: String!

    items: [CertificateOrderItem!]!
  ): SubmittedOrder!
}
`;

type CertificateOrderItem = {|
  id: string,
  name: string,
  quantity: number,
|};

type SubmittedOrder = {|
  id: string,
|};

type submitDeathCertificateOrderArgs = {|
  contactName: string,
  contactEmail: string,
  contactPhone: string,

  shippingName: string,
  shippingCompanyName: string,
  shippingAddress1: string,
  shippingAddress2: string,
  shippingCity: string,
  shippingState: string,
  shippingZip: string,

  cardToken: string,
  cardLast4: string,

  cardholderName: string,
  billingAddress1: string,
  billingAddress2: string,
  billingCity: string,
  billingState: string,
  billingZip: string,

  items: Array<CertificateOrderItem>,
|};

export const resolvers = {
  Mutation: {
    submitDeathCertificateOrder: async (
      root: mixed,
      args: submitDeathCertificateOrderArgs,
      { stripe }: Context
    ): Promise<SubmittedOrder> => {
      const { cardToken, items } = args;

      const totalQuantity = items.reduce(
        (count, { quantity }) => count + Math.max(quantity, 0),
        0
      );

      if (totalQuantity === 0) {
        throw new Error('Quantity of order is 0');
      }

      const { total } = calculateCost(totalQuantity);

      const charge = await stripe.charges.create({
        amount: total,
        currency: 'usd',
        source: cardToken,
        description: 'Death certificates (Registry)',
      });

      return { id: charge.id };
    },
  },
};
