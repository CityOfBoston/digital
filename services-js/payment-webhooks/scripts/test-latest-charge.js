// @flow
/* eslint no-console: 0 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

import makeStripe from 'stripe';

dotenv.config();

(async function testLatestCharge() {
  const stripe = makeStripe(process.env.STRIPE_SECRET_KEY || 'no-key-provided');

  const latestEvents = await stripe.events.list({
    type: 'charge.succeeded',
    limit: 1,
  });

  if (latestEvents.data.length === 0) {
    throw new Error('No charge.succeeded events found in the Stripe account');
  }

  await fetch(`http://localhost:${process.env.PORT || '5000'}/stripe`, {
    method: 'post',
    headers: {
      'Stripe-Signature': 'fake-stripe-signature',
    },
    body: JSON.stringify(latestEvents.data[0]),
  });
})().catch(err => {
  console.error(err);
  process.exit(1);
});
