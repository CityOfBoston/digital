// @flow

import type { Context } from '.';

import {
  calculateCreditCardCost,
  calculateDebitCardCost,
} from '../../lib/costs';

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

      // Math.max here to make sure you can't order negative death certificates
      // to offset the cost of real ones.
      const totalQuantity = items.reduce(
        (count, { quantity }) => count + Math.max(quantity, 0),
        0
      );

      if (totalQuantity === 0) {
        throw new Error('Quantity of order is 0');
      }

      // We have to look the token up again so we can figure out what fee
      // structure to use. We do *not* trust the client to send us this
      // information.
      const token = await stripe.tokens.retrieve(cardToken);

      const { total } =
        token.card.funding === 'credit'
          ? calculateCreditCardCost(totalQuantity)
          : calculateDebitCardCost(totalQuantity);

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
