/* eslint no-console: 0 */
import Stripe, { charges, webhooks } from 'stripe';

import RegistryDb from './services/RegistryDb';
import Emails from './services/Emails';

import {
  loadDeathCertificateItems,
  orderToReceiptInfo,
} from './graphql/death-certificates';

import {
  FIXED_CC_SERVICE_FEE,
  PERCENTAGE_CC_SERVICE_FEE,
  SERVICE_FEE_URI,
} from '../lib/costs';
import { ReceiptData } from './email/EmailTemplates';

interface Dependencies {
  emails: Emails;
  stripe: Stripe;
  registryDb: RegistryDb;
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
  { emails, registryDb }: Dependencies,
  charge: charges.ICharge
) {
  const {
    metadata: {
      'webapp.name': webappName,
      'webapp.nodeEnv': webappNodeEnv,
      'order.orderKey': orderKey,
      'order.orderId': orderId,
      'order.orderType': orderType,
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

  const dbOrder = await registryDb.findOrder(orderId);

  if (!dbOrder) {
    throw new Error(`Order ${orderId} not found in the database`);
  }

  // Birth certs won't be captured the first time around.
  if (charge.captured) {
    // By marking the payment as successful we can tell Registry they can proceed
    // with fulfillment. This method is idempotent.
    await registryDb.addPayment(
      parseInt(orderKey, 10),
      // Unix epoch seconds -> milliseconds
      new Date(charge.created * 1000),
      charge.id,
      // Per Rich, this should be the total amount charged by Stripe, including
      // their fee, not just the subtotal we receive.
      charge.amount / 100
    );
  }

  // We slightly-hackily rely on the DB order -> JS object code from the GraphQL
  // side of things. This could be more principled.
  const order = orderToReceiptInfo(orderId, dbOrder);
  let subtotal = order.subtotal;
  let total = order.total;

  let items: ReceiptData['items'] = [];

  if (orderType === 'DC') {
    // loadDeathCertificateItems comes from the GraphQL side of things first and
    // foremost, so it returns an async function for the certificate so that the
    // extra DB lookup (needed for certificate name) doesn’t have to happen if
    // it’s not requested by the query. Since we do need the name for the
    // receipt, we have to trigger and then resolve the promises.
    items = await Promise.all(
      loadDeathCertificateItems(registryDb, dbOrder).items.map(
        async ({ quantity, cost, certificate }) => ({
          quantity,
          cost,
          name: nameFromCertificate(await certificate()),
          date: null,
        })
      )
    );
  } else if (orderType === 'BC') {
    const details = await registryDb.lookupBirthCertificateOrderDetails(
      orderId
    );

    if (!details) {
      throw new Error(`Birth certificate order ${orderId} not found`);
    }

    // We can't get these from Order in birth certificates, they come in as
    // null.
    subtotal = details.TotalCost * 100;
    total = subtotal + order.serviceFee;

    items = [
      {
        quantity: details.Quantity,
        cost: details.TotalCost * 100,
        name: `${details.CertificateFirstName} ${details.CertificateLastName}`,
        date: details.DateOfBirth,
      },
    ];
  }

  // Sending the email is not idempotent, so we put it last and in the vast
  // majority of cases it will run once.
  await emails.sendReceiptEmail(order.contactName, order.contactEmail, {
    isBirth: orderType === 'BC',
    isDeath: orderType === 'DC',
    orderId: order.id,
    orderDate: order.date,
    shippingName: order.shippingName,
    shippingCompanyName: order.shippingCompanyName,
    shippingAddress1: order.shippingAddress1,
    shippingAddress2: order.shippingAddress2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingZip: order.shippingZip,
    subtotal,
    serviceFee: order.serviceFee,
    total,
    fixedFee: FIXED_CC_SERVICE_FEE,
    percentageFee: PERCENTAGE_CC_SERVICE_FEE,
    serviceFeeUri: SERVICE_FEE_URI,
    items,
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
  webhookSecret: string | undefined,
  webhookSignature: string,
  body: string
): Promise<void> {
  const event: webhooks.StripeWebhookEvent<any> = webhookSecret
    ? deps.stripe.webhooks.constructEvent(body, webhookSignature, webhookSecret)
    : JSON.parse(body);

  if (process.env['NODE_ENV'] !== 'test') {
    console.log(
      'STRIPE WEBHOOK: ',
      JSON.stringify({ ...event, data: 'REDACTED' })
    );
  }

  switch (event.type) {
    // TODO(fiona): Handle 'charge.captured' here for birth certificates and
    // send out an email
    case 'charge.succeeded':
      await processChargeSucceeded(deps, event.data.object as charges.ICharge);
      break;
    default:
      break;
  }
}
