// @flow

import {
  FIXED_SERVICE_FEE,
  PERCENTAGE_SERVICE_FEE,
  calculateCost,
} from './costs';

// We run this over a bunch of different amounts to verify that, after rounding
// and everything, when Stripe takes its cut of the final value we’ll be left
// with the right certificate cost for Registry.
it(`calculates service fee correctly for certificates`, () => {
  for (let q = 1; q < 100; ++q) {
    const { total, serviceFee, subtotal } = calculateCost(q);

    // Stripe rounding: https://support.stripe.com/questions/what-rules-do-you-use-for-rounding-stripe-fees
    const stripesCut = Math.round(
      total * PERCENTAGE_SERVICE_FEE + FIXED_SERVICE_FEE
    );

    expect(stripesCut).toEqual(serviceFee);
    expect(total - stripesCut).toEqual(subtotal);
  }
});
