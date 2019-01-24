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
  BIRTH_CERTIFICATE_COST,
} from '../../lib/costs';

import makePaymentValidator from '../../lib/validators/PaymentValidator';
import makeShippingValidator from '../../lib/validators/ShippingValidator';
import { OrderType } from '../services/RegistryDb';

/** @graphql input */
interface DeathCertificateOrderItemInput {
  id: string;
  name: string;
  quantity: Int;
}

/**
 * This is the data registry needs to process a birth certificate request.
 *
 * @graphql input
 */
interface BirthCertificateOrderItemInput {
  firstName: string;
  lastName: string;
  alternateSpellings: string;
  birthDate: Date;
  parent1FirstName: string;
  parent1LastName: string;
  parent2FirstName: string;
  parent2LastName: string;
  relationship: string;
  quantity: Int;
}

/**
 * Either order or error will be non-null.
 */
interface OrderResult {
  order: SubmittedOrder | null;
  error: OrderError | null;
}

interface OrderError {
  message: string;
  cause: OrderErrorCause;
}

interface SubmittedOrder {
  id: string;
  contactEmail: string;
}

enum OrderErrorCause {
  /** Problem is a card error that the user should be able to correct. */
  USER_PAYMENT = 'USER_PAYMENT',
  INTERNAL = 'INTERNAL',
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

    items: DeathCertificateOrderItemInput[];
    idempotencyKey: string;
  }): OrderResult;

  submitBirthCertificateOrder(args: {
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

    item: BirthCertificateOrderItemInput;

    idempotencyKey: string;
  }): OrderResult;
}

const mutationResolvers: Resolvers<Mutation, Context> = {
  submitDeathCertificateOrder: async (
    _root,
    args,
    { rollbar, stripe, emails, registryDb }
  ): Promise<OrderResult> => {
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

    validateAddresses(args);

    // These are all in cents, to match Stripe
    const { total, serviceFee } = await calculateCostForToken(
      stripe,
      DEATH_CERTIFICATE_COST,
      cardToken,
      totalQuantity
    );

    const orderId = makeOrderId(OrderType.DeathCertificate);
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
        registryDb.addDeathCertificateItem(
          orderKey,
          parseInt(id, 10),
          name,
          quantity,
          DEATH_CERTIFICATE_COST / 100
        )
      )
    );

    try {
      await makeStripeCharge(
        OrderType.DeathCertificate,
        { stripe, registryDb, rollbar, emails },
        {
          orderId,
          orderKey,
          quantity: totalQuantity,
          total,
          cardToken,
        }
      );
    } catch (e) {
      // These are user errors due to bad submissions (e.g. wrong CVV code)
      if (e.type === 'StripeCardError') {
        return {
          order: null,
          error: {
            message: e.message,
            cause: OrderErrorCause.USER_PAYMENT,
          },
        };
      } else {
        // This will cause it to get logged with Rollbar
        throw e;
      }
    }

    return { order: { id: orderId, contactEmail }, error: null };
  },

  submitBirthCertificateOrder: async (
    _root,
    args,
    { rollbar, stripe, emails, registryDb }
  ): Promise<OrderResult> => {
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

      item,

      idempotencyKey,
    } = args;

    if (item.quantity <= 0) {
      throw new Error('Certificate quantity may not be less than 0');
    }

    validateAddresses(args);

    // These are all in cents, to match Stripe
    const { total, serviceFee } = await calculateCostForToken(
      stripe,
      BIRTH_CERTIFICATE_COST,
      cardToken,
      item.quantity
    );

    const orderId = makeOrderId(OrderType.BirthCertificate);
    const orderDate = new Date();

    const orderKey = await registryDb.addOrder(OrderType.BirthCertificate, {
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

    await registryDb.addBirthCertificateRequest(
      orderKey,
      {
        certificateFirstName: item.firstName,
        certificateLastName: item.lastName,
        alternativeSpellings: item.alternateSpellings,
        dateOfBirth: item.birthDate,
        parent1FirstName: item.parent1FirstName,
        parent1LastName: item.parent1LastName,
        parent2FirstName: item.parent2FirstName,
        parent2LastName: item.parent2LastName,
      },
      item.quantity,
      BIRTH_CERTIFICATE_COST / 100
    );

    try {
      await makeStripeCharge(
        OrderType.BirthCertificate,
        { stripe, registryDb, rollbar, emails },
        {
          orderId,
          orderKey,
          quantity: item.quantity,
          total,
          cardToken,
        }
      );
    } catch (e) {
      // These are user errors due to bad submissions (e.g. wrong CVV code)
      if (e.type === 'StripeCardError') {
        return {
          order: null,
          error: {
            message: e.message,
            cause: OrderErrorCause.USER_PAYMENT,
          },
        };
      } else {
        // This will cause it to get logged with Rollbar
        throw e;
      }
    }

    return { order: { id: orderId, contactEmail }, error: null };
  },
};

/**
 * Throws an exception if the arguments do not match the shipping / payment
 * validators.
 */
function validateAddresses(args: {
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
}) {
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

    cardholderName,
    billingAddress1,
    billingAddress2,
    billingCity,
    billingState,
    billingZip,
  } = args;

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
}

async function calculateCostForToken(
  stripe: any,
  eachCost: number,
  cardToken: string,
  quantity: number
) {
  // We have to look the token up again so we can figure out what fee
  // structure to use. We do *not* trust the client to send us this
  // information.
  const token = await stripe.tokens.retrieve(cardToken);

  return token.card.funding === 'credit'
    ? calculateCreditCardCost(eachCost, quantity)
    : calculateDebitCardCost(eachCost, quantity);
}

function makeOrderId(type: OrderType): string {
  let prefix: string;

  switch (type) {
    case OrderType.BirthCertificate:
      prefix = 'BC';
      break;
    case OrderType.DeathCertificate:
      prefix = 'DC';
      break;
    default:
      throw new Error('Unexpected OrderType: ' + type);
  }

  const datePart = moment().format('YYYYMM');

  // gives us a 6-digit number that doesn't start with 0
  const randomPart = 100000 + Math.floor(Math.abs(Math.random()) * 899999);

  return `RG-${prefix}${datePart}-${randomPart}`;
}

async function makeStripeCharge(
  type: OrderType,
  {
    stripe,
    registryDb,
    rollbar,
    emails,
  }: Pick<Context, 'stripe' | 'registryDb' | 'rollbar' | 'emails'>,
  {
    total,
    cardToken,
    orderId,
    orderKey,
    quantity,
  }: {
    total: number;
    cardToken: string;
    orderId: string;
    orderKey: number;
    quantity: number;
  }
): Promise<void> {
  let description: string;
  let unitPrice: number;
  let capture: boolean;

  switch (type) {
    case OrderType.DeathCertificate:
      description = 'Death certificates (Registry)';
      unitPrice = DEATH_CERTIFICATE_COST;
      capture = true;
      break;
    case OrderType.BirthCertificate:
      description = 'Birth certificates (Registry)';
      unitPrice = BIRTH_CERTIFICATE_COST;
      capture = false;
      break;
    default:
      throw new Error('Unknown OrderType: ' + type);
  }

  try {
    const charge = await stripe.charges.create({
      amount: total,
      currency: 'usd',
      source: cardToken,
      description,
      capture,
      statement_descriptor: 'CITYBOSTON*REG + FEE',
      metadata: {
        'webapp.name': 'registry-certs',
        'webapp.nodeEnv': process.env.NODE_ENV || 'development',
        'order.orderId': orderId,
        'order.orderKey': orderKey.toString(),
        'order.orderType': type,
        'order.source': 'registry',
        'order.quantity': quantity.toString(),
        'order.unitPrice': unitPrice.toString(),
      },
    });

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
  } catch (e) {
    try {
      await registryDb.cancelOrder(orderKey, 'Stripe charge create failed');
    } catch (e) {
      console.log('CANCEL ORDER FAILED');
      // Let Rollbar know, but still fail the mutation with the original
      // error.
      rollbar.error(e);
    }

    throw e;
  }
}

export const resolvers = {
  Mutation: mutationResolvers,
};
