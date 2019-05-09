/* eslint no-console: 0 */

import Stripe, { webhooks, charges } from 'stripe';
import INovah from './services/INovah';

import Rollbar from 'rollbar';

type Dependencies = {
  inovah: INovah;
  rollbar: Rollbar;
  stripe: Stripe;
};

/**
 * Called when a charge is created or finally captured to update iNovah with the
 * transaction information, and then update the charge with the iNovah reference
 * info.
 */
async function processChargeSucceeded(
  { rollbar, stripe, inovah }: Dependencies,
  charge: charges.ICharge
): Promise<void> {
  // Birth cert charges aren't captured at first, we wait until the Registry
  // department fulfills the order to do that. Treasury doesn't want to hear
  // about the money until it’s captured, so we exit out here without sending
  // it to iNovah.
  if (!charge.captured) {
    console.log(`Skipping charge ${charge.id}: not yet captured`);
    return;
  }

  // The Charge object only has the gross amount charged to the customer, so we
  // need to look up the associated transaction to find the net amount that will
  // be deposited into our account.
  const latestCharge = await stripe.charges.retrieve(charge.id, {
    expand: ['balance_transaction'],
  });

  if (typeof latestCharge.balance_transaction === 'string') {
    throw new Error('balance_transaction not expanded');
  }

  if (
    latestCharge.metadata['inovah.transactionId'] &&
    !process.env.SKIP_IDEMPOTENCY_CHECKS
  ) {
    console.log(
      `Charge ${charge.id} already has an iNovah transaction ID saved`
    );
    return;
  }

  const balanceTransaction = latestCharge.balance_transaction;
  const orderType = charge.metadata['order.orderType'] || 'DC';

  const source = charge.source;

  if (source.object !== 'card') {
    throw new Error(`Unexpected source type: ${source.object}`);
  }

  // Stripe works in cents, iNovah in floating-point dollars.
  const amountInDollars = balanceTransaction.net / 100;

  const {
    transactionId,
    transactionNum,
    batchId,
    batchNum,
  } = await inovah.addTransaction(
    charge.metadata['order.orderId'] || 'unknown',
    charge.id,
    balanceTransaction.id,
    orderType,
    {
      amountInDollars,
      quantity: parseInt(charge.metadata['order.quantity'] || '0', 10),
      unitPriceInDollars:
        parseInt(charge.metadata['order.unitPrice'] || '0', 10) / 100,
    },
    {
      cardholderName: source.name || '',
      billingAddress1: source.address_line1 || '',
      billingAddress2: source.address_line2 || '',
      billingCity: source.address_city || '',
      billingState: source.address_state || '',
      billingZip: source.address_zip,
    }
  );

  if (process.env.NODE_ENV !== 'test') {
    console.log(`Added charge ${charge.id} to iNovah:`, {
      transactionId,
      batchId,
      amountInDollars,
    });
  }

  try {
    await stripe.charges.update(charge.id, {
      metadata: {
        'inovah.transactionId': transactionId,
        'inovah.transactionNum': transactionNum,
        'inovah.batchId': batchId,
        'inovah.batchNum': batchNum,
      },
    });
  } catch (e) {
    // Don't fail things if we aren't able to back-update Stripe
    rollbar.error(e);
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
    case 'charge.succeeded':
      await processChargeSucceeded(deps, event.data.object as charges.ICharge);
      break;
    case 'charge.captured':
      await processChargeSucceeded(deps, event.data.object as charges.ICharge);
      break;
    default:
      break;
  }
}
