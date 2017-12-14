// @flow
/* eslint no-console: 0 */

import type { NodeStripe, Event, Charge } from 'stripe';
import type INovah, { INovahFactory } from './services/iNovah';

export type Dependencies = {|
  inovahFactory: INovahFactory,
|};

async function processChargeSucceeded(
  stripe: NodeStripe,
  inovah: INovah,
  charge: Charge
): Promise<void> {
  // The Charge object only has the gross amount charged to the customer, so we
  // need to look up the associated transaction to find the net amount that will
  // be deposited into our account.
  const balanceTransaction = await stripe.balance.retrieveTransaction(
    charge.balance_transaction
  );

  // Stripe works in cents, iNovah in floating-point dollars.
  await inovah.addTransaction(balanceTransaction.net / 100);
}

export async function processStripeEvent(
  stripe: NodeStripe,
  inovah: INovah,
  event: Event
): Promise<void> {
  console.log('STRIPE WEBHOOK: ', JSON.stringify(event));

  switch (event.type) {
    case 'charge.succeeded':
      await processChargeSucceeded(stripe, inovah, event.data.object);
      break;
    default:
      break;
  }
}
