/* eslint no-console: 0 */

import { Context } from '.';
import moment from 'moment';

import {
  Resolvers,
  ResolvableWith,
  Int,
} from '@cityofboston/graphql-typescript';

import { processChargeSucceeded } from '../stripe-events';

import {
  DEATH_CERTIFICATE_COST,
  calculateCreditCardCost,
  calculateDebitCardCost,
} from '../../lib/costs';

import makePaymentValidator from '../../lib/validators/PaymentValidator';
import makeShippingValidator from '../../lib/validators/ShippingValidator';
import { OrderType } from '../services/RegistryDb';

/** @graphql input */
interface CertificateOrderItemInput {
  id: string;
  name: string;
  quantity: Int;
}

interface SubmittedOrder {
  id: string;
  contactEmail: string;
}

export interface Mutation extends ResolvableWith<{}> {
  submitDeathCertificateOrder(args: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;

    shippingName: string;
    shippingCompanyName: string;
    shippingAddress1: string;
    shippingAddress2: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;

    cardToken: string;
    cardLast4: string;

    cardholderName: string;
    billingAddress1: string;
    billingAddress2: string;
    billingCity: string;
    billingState: string;
    billingZip: string;

    items: CertificateOrderItemInput[];
    idempotencyKey: string;
  }): SubmittedOrder;
}

const mutationResolvers: Resolvers<Mutation, Context> = {
  submitDeathCertificateOrder: async (
    _root,
    args,
    { rollbar, stripe, emails, registryDb }
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

    const shippingValidator = makeShippingValidator({
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

    const paymentValidator = makePaymentValidator({
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
    const { total, serviceFee } =
      token.card.funding === 'credit'
        ? calculateCreditCardCost(DEATH_CERTIFICATE_COST, totalQuantity)
        : calculateDebitCardCost(DEATH_CERTIFICATE_COST, totalQuantity);

    const datePart = moment().format('YYYYMM');

    // gives us a 6-digit number that doesn't start with 0
    const randomPart = 100000 + Math.floor(Math.abs(Math.random()) * 899999);

    const orderId = `RG-DC${datePart}-${randomPart}`;
    const orderDate = new Date();

    const orderKey = await registryDb.addOrder(OrderType.DeathCertificate, {
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
        registryDb.addItem(
          OrderType.DeathCertificate,
          orderKey,
          parseInt(id, 10),
          name,
          quantity,
          DEATH_CERTIFICATE_COST / 100
        )
      )
    );

    let charge;
    try {
      charge = await stripe.charges.create({
        amount: total,
        currency: 'usd',
        source: cardToken,
        description: 'Death certificates (Registry)',
        statement_descriptor: 'CITYBOSTON*REG + FEE',
        metadata: {
          'webapp.name': 'registry-certs',
          'webapp.nodeEnv': process.env.NODE_ENV || 'development',
          'order.orderId': orderId,
          'order.orderKey': orderKey.toString(),
          'order.source': 'registry',
          'order.quantity': totalQuantity.toString(),
          'order.unitPrice': DEATH_CERTIFICATE_COST.toString(),
        },
      });
    } catch (e) {
      if (e.type === 'StripeCardError') {
        // Keeps us from sending customer errors to Stripe
        e.silent = true;
      }

      try {
        await registryDb.cancelOrder(orderKey, 'Stripe charge create failed');
      } catch (e) {
        console.log('CANCEL ORDER FAILED');
        // Let Opbeat know, but still fail the mutation with the original
        // error.
        rollbar.error(e);
      }

      throw e;
    }

    // The Stripe charge is the last thing in the request because if it
    // succeeds, we consider the order to have been completed successfully.
    // (This is certainly true from the customer’s perspective!)
    //
    // Sending the receipt email and marking the order as paid in the DB is
    // handled in response to a Stripe webhook for maximum reliability
    // (because Stripe will retry webhooks if they fail).

    // We can only get the Stripe callback when in production, so we fake it for dev.
    if (process.env.NODE_ENV === 'development') {
      await processChargeSucceeded({ stripe, emails, registryDb }, charge);
    }

    return { id: orderId, contactEmail };
  },
};

export const resolvers = {
  Mutation: mutationResolvers,
};
