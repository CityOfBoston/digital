// @flow
/* eslint no-console: 0 */

import type { Context } from '.';
import moment from 'moment';

import {
  CERTIFICATE_COST,
  FIXED_CC_SERVICE_FEE,
  PERCENTAGE_CC_SERVICE_FEE,
  calculateCreditCardCost,
  calculateDebitCardCost,
} from '../../lib/costs';

import makePaymentValidator from '../../lib/validators/PaymentValidator';
import makeShippingValidator from '../../lib/validators/ShippingValidator';

export const Schema = `
input CertificateOrderItemInput {
  id: String!
  name: String!
  quantity: Int!
}

type SubmittedOrder {
  id: String!
  contactEmail: String!
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

    items: [CertificateOrderItemInput!]!

    idempotencyKey: String!
  ): SubmittedOrder!
}
`;

type CertificateOrderItemInput = {|
  id: string,
  name: string,
  quantity: number,
|};

type SubmittedOrder = {
  id: string,
  contactEmail: string,
};

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

  items: Array<CertificateOrderItemInput>,
  idempotencyKey: string,
|};

export const resolvers = {
  Mutation: {
    submitDeathCertificateOrder: async (
      root: mixed,
      args: SubmitDeathCertificateOrderArgs,
      { opbeat, stripe, registryOrders, emails }: Context
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
        idempotencyKey,
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

      const shippingValidator = new makeShippingValidator({
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
      });

      const paymentValidator = new makePaymentValidator({
        cardholderName,
        billingAddressSameAsShippingAddress: false,
        billingAddress1,
        billingAddress2,
        billingCity,
        billingState,
        billingZip,
      });

      shippingValidator.check();
      paymentValidator.check();

      if (shippingValidator.fails() || paymentValidator.fails()) {
        const errors = {
          ...shippingValidator.errors.all(),
          ...paymentValidator.errors.all(),
        };
        const message = Object.keys(errors)
          .map(field => `${field}: ${errors[field].join(', ')}`)
          .join('\n');

        const err: any = new Error('Shipping validation errors');
        err.message = message;

        throw err;
      }

      // We have to look the token up again so we can figure out what fee
      // structure to use. We do *not* trust the client to send us this
      // information.
      const token = await stripe.tokens.retrieve(cardToken);

      // These are all in cents, to match Stripe
      const { total, serviceFee, subtotal } =
        token.card.funding === 'credit'
          ? calculateCreditCardCost(totalQuantity)
          : calculateDebitCardCost(totalQuantity);

      const datePart = moment().format('YYYYMM');

      // gives us a 6-digit number that doesn't start with 0
      const randomPart = 100000 + Math.floor(Math.abs(Math.random()) * 899999);

      const orderId = `RG-DC${datePart}-${randomPart}`;
      const orderDate = new Date();

      const orderKey = await registryOrders.addOrder({
        orderID: orderId,
        orderDate,
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
        idempotencyKey,
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
          'order.orderId': orderId,
          'order.orderKey': orderKey.toString(),
          'order.source': 'registry',
          'order.quantity': totalQuantity.toString(),
          'order.unitPrice': CERTIFICATE_COST.toString(),
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
          console.log(`ISSUING REFUND FAILED. MANUALLY REFUND ${charge.id}`);

          // Let Opbeat know, but still fail the mutation with the original
          // error.
          opbeat.captureError(e);
        }

        throw e;
      }

      emails.sendReceiptEmail(contactEmail, {
        orderId,
        orderDate,
        shippingName,
        shippingCompanyName,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingZip,
        subtotal,
        serviceFee,
        total,
        items: items.map(({ id, name, quantity }) => ({
          id,
          name,
          quantity,
          cost: quantity * CERTIFICATE_COST,
        })),
        fixedFee: FIXED_CC_SERVICE_FEE,
        percentageFee: PERCENTAGE_CC_SERVICE_FEE,
      });

      return { id: orderId, contactEmail };
    },
  },
};
