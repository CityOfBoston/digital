// @flow
/* eslint no-console: 0 */

import type { Context } from '.';

import {
  CERTIFICATE_COST,
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

const padNum = (n: number) => (n < 10 ? `0${n}` : `${n}`);

type CertificateOrderItem = {|
  id: string,
  name: string,
  quantity: number,
|};

type SubmittedOrder = {|
  id: string,
|};

type SubmitDeathCertificateOrderArgs = {|
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
      args: SubmitDeathCertificateOrderArgs,
      { opbeat, stripe, registryOrders }: Context
    ): Promise<SubmittedOrder> => {
      const {
        contactName,
        contactEmail,
        contactPhone,

        shippingName,
        shippingCompanyName,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingZip,

        cardToken,
        cardLast4,

        cardholderName,
        billingAddress1,
        billingAddress2,
        billingCity,
        billingState,
        billingZip,

        items,
      } = args;

      let totalQuantity = 0;
      items.forEach(({ quantity }) => {
        if (quantity <= 0) {
          throw new Error('Certificate quantity may not be less than 0');
        } else {
          totalQuantity += quantity;
        }
      });

      if (totalQuantity === 0) {
        throw new Error('Quantity of order is 0');
      }

      // We have to look the token up again so we can figure out what fee
      // structure to use. We do *not* trust the client to send us this
      // information.
      const token = await stripe.tokens.retrieve(cardToken);

      const { total, serviceFee } =
        token.card.funding === 'credit'
          ? calculateCreditCardCost(totalQuantity)
          : calculateDebitCardCost(totalQuantity);

      const now = new Date();
      const datePart = `${now.getFullYear()}${padNum(
        now.getMonth() + 1
      )}${padNum(now.getDate())}`;

      const randomPart = Math.random()
        .toString(36)
        .substr(2, 5);

      const orderId = `REG-DC-${datePart}-${randomPart}`;

      const orderKey = await registryOrders.addOrder({
        orderID: orderId,
        orderDate: new Date(),
        contactName,
        contactEmail,
        contactPhone,
        shippingName,
        shippingCompany: shippingCompanyName,
        shippingAddr1: shippingAddress1,
        shippingAddr2: shippingAddress2,
        shippingCity,
        shippingState,
        shippingZIP: shippingZip,
        billingName: cardholderName,
        billingAddr1: billingAddress1,
        billingAddr2: billingAddress2,
        billingCity,
        billingState,
        billingZIP: billingZip,
        billingLast4: cardLast4,
        serviceFee: serviceFee / 100,
      });

      await Promise.all(
        items.map(({ id, name, quantity }) =>
          registryOrders.addItem(
            orderKey,
            parseInt(id, 10),
            name,
            quantity,
            CERTIFICATE_COST / 100
          )
        )
      );

      const charge = await stripe.charges.create({
        amount: total,
        currency: 'usd',
        source: cardToken,
        description: 'Death certificates (Registry)',
        metadata: {
          'registry.orderId': orderId,
          'registry.orderKey': orderKey.toString(),
        },
      });

      try {
        await registryOrders.addPayment(
          orderKey,
          // Unix epoch seconds -> milliseconds
          new Date(charge.created * 1000),
          charge.id,
          charge.amount / 100
        );
      } catch (e) {
        console.log('ADD PAYMENT FAILED, ISSUING REFUND');

        try {
          await stripe.refunds.create({
            charge: charge.id,
            metadata: {
              'registry.orderId': orderId,
              'registry.orderKey': orderKey.toString(),
              'registry.error': e.message || e.toString(),
            },
          });
        } catch (e) {
          // Let Opbeat know, but still fail the mutation with the original
          // error.
          opbeat.captureError(e);
        }

        throw e;
      }

      return { id: orderId };
    },
  },
};
