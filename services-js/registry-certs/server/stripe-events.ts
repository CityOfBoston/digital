/* eslint no-console: 0 */
import RegistryData from './services/RegistryData';
import RegistryOrders from './services/RegistryOrders';
import Emails from './services/Emails';
import { NodeStripe, Event, Charge } from 'stripe';

import { loadOrder } from './graphql/death-certificates';

import {
  FIXED_CC_SERVICE_FEE,
  PERCENTAGE_CC_SERVICE_FEE,
  SERVICE_FEE_URI,
} from '../lib/costs';

interface Dependencies {
  emails: Emails;
  stripe: NodeStripe;
  registryData: RegistryData;
  registryOrders: RegistryOrders;
}

// We handle Stripe’s "charge.succeeded" event to complete the order process:
//   - Mark the order as "paid" in the backend so that fulfillment can complete
//   - Send a receipt email
//
// We do this from Stripe’s webhook to take advantage of their reliability
// features. If the charge succeeded, THE ORDER MUST BE PLACED for the customer.
// If we tried to do this inline in the mutation after the charge API call,
// there’s a chance that the database write would fail, or the email wouldn’t
// send.
//
// If those things happen in this case, we’ll send a 500 back to Stripe and it
// will retry. If it keeps failing, Stripe will notify us of the issue.
//
// Note that there is a non-zero chance that Stripe will call this twice for the
// same charge, meaning we will send 2 emails to the customer about the order.
// That’s a better choice than not sending an email at all or causing delays in
// fulfillment, so we can live with it.
export async function processChargeSucceeded(
  { emails, registryData, registryOrders }: Dependencies,
  charge: Charge
) {
  const {
    metadata: {
      'webapp.name': webappName,
      'webapp.nodeEnv': webappNodeEnv,
      'order.orderKey': orderKey,
      'order.orderId': orderId,
    },
  } = charge;

  // We're going to get every Stripe event, so make sure that we’e only handling
  // our own. Also, we do the NODE_ENV check so that charges made in dev (which
  // still go to Test Stripe) don’t cause staging to send an email.
  if (
    webappName !== 'registry-certs' ||
    webappNodeEnv !== process.env.NODE_ENV
  ) {
    return;
  }

  // We slightly-hackily rely on the DB order -> JS object code from the GraphQL
  // side of things. This could be more principled.
  const order = await loadOrder(registryData, registryOrders, orderId);

  if (!order) {
    throw new Error(`Order ${orderId} not found in the database`);
  }

  // By marking the payment as successful we can tell Registry they can proceed
  // with fulfillment. This method is idempotent.
  await registryOrders.addPayment(
    parseInt(orderKey, 10),
    // Unix epoch seconds -> milliseconds
    new Date(charge.created * 1000),
    charge.id,
    // Per Rich, this should be the total amount charged by Stripe, including
    // their fee, not just the subtotal we receive.
    charge.amount / 100
  );

  // Sending the email is not idempotent, so we put it last and in the vast
  // majority of cases it will run once.
  await emails.sendReceiptEmail(order.contactName, order.contactEmail, {
    orderId: order.id,
    orderDate: order.date,
    shippingName: order.shippingName,
    shippingCompanyName: order.shippingCompanyName,
    shippingAddress1: order.shippingAddress1,
    shippingAddress2: order.shippingAddress2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingZip: order.shippingZip,
    subtotal: order.subtotal,
    serviceFee: order.serviceFee,
    total: order.total,
    fixedFee: FIXED_CC_SERVICE_FEE,
    percentageFee: PERCENTAGE_CC_SERVICE_FEE,
    serviceFeeUri: SERVICE_FEE_URI,
    // loadOrder comes from the GraphQL side of things first and foremost, so it
    // returns an async function for the certificate so that the extra DB lookup
    // (needed for certificate name) doesn’t have to happen if it’s not
    // requested by the query. Since we do need the name for the receipt, we
    // have to trigger and then resolve the promises.
    items: await Promise.all(
      order.items.map(async ({ id, quantity, cost, certificate }) => ({
        id,
        quantity,
        cost,
        name: nameFromCertificate(await certificate()),
      }))
    ),
  });
}

function nameFromCertificate(cert) {
  if (cert) {
    return `${cert.firstName} ${cert.lastName}`;
  } else {
    // typically should not happen, but we need to guard anyway
    return 'UNKNOWN CERTIFICATE';
  }
}

export async function processStripeEvent(
  deps: Dependencies,
  webhookSecret: string | null,
  webhookSignature: string,
  body: string
): Promise<void> {
  const event: Event = webhookSecret
    ? deps.stripe.webhooks.constructEvent(body, webhookSignature, webhookSecret)
    : JSON.parse(body);

  if (process.env['NODE_ENV'] !== 'test') {
    console.log(
      'STRIPE WEBHOOK: ',
      JSON.stringify({ ...event, data: 'REDACTED' })
    );
  }

  switch (event.type) {
    case 'charge.succeeded':
      await processChargeSucceeded(deps, event.data.object);
      break;
    default:
      break;
  }
}
