// @flow
/* eslint no-console: 0 */

import type { NodeStripe, Event, Charge } from 'stripe';
import type INovah from './services/iNovah';

type Opbeat = $Exports<'opbeat'>;

type Dependencies = {|
  inovah: INovah,
  opbeat: Opbeat,
  stripe: NodeStripe,
|};

async function processChargeSucceeded(
  { opbeat, stripe, inovah }: Dependencies,
  charge: Charge
): Promise<void> {
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

  const {
    transactionId,
    transactionNum,
    batchId,
    batchNum,
  } = await inovah.addTransaction(
    charge.metadata['order.orderId'] || 'unknown',
    charge.id,
    {
      // Stripe works in cents, iNovah in floating-point dollars.
      amountInDollars: balanceTransaction.net / 100,
      quantity: parseInt(charge.metadata['order.quantity'] || '0', 10),
      unitPriceInDollars:
        parseInt(charge.metadata['order.unitPrice'] || '0', 10) / 100,
    },
    {
      cardholderName: charge.source.name,
      billingAddress1: charge.source.address_line1,
      billingAddress2: charge.source.address_line2,
      billingCity: charge.source.address_city,
      billingState: charge.source.address_state,
      billingZip: charge.source.address_zip,
    }
  );

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
    opbeat.captureError(e);
  }
}

export async function processStripeEvent(
  deps: Dependencies,
  webhookSecret: ?string,
  webhookSignature: string,
  body: string
): Promise<void> {
  const event: Event = webhookSecret
    ? deps.stripe.webhooks.constructEvent(body, webhookSignature, webhookSecret)
    : JSON.parse(body);

  console.log('STRIPE WEBHOOK: ', JSON.stringify(event));

  switch (event.type) {
    case 'charge.succeeded':
      await processChargeSucceeded(deps, event.data.object);
      break;
    default:
      break;
  }
}
