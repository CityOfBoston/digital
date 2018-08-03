import {
  FIXED_CC_SERVICE_FEE,
  PERCENTAGE_CC_SERVICE_FEE,
  calculateCreditCardCost,
} from './costs';

// We run this over a bunch of different amounts to verify that, after rounding
// and everything, when Stripe takes its cut of the final value we’ll be left
// with the right certificate cost for Registry.
it(`calculates service fee correctly for certificates`, () => {
  for (let q = 0; q < 100; ++q) {
    const { total, serviceFee, subtotal } = calculateCreditCardCost(q);

    // Stripe rounding: https://support.stripe.com/questions/what-rules-do-you-use-for-rounding-stripe-fees
    const stripesCut = Math.round(
      total * PERCENTAGE_CC_SERVICE_FEE + FIXED_CC_SERVICE_FEE
    );

    expect(stripesCut).toEqual(serviceFee);
    expect(total - stripesCut).toEqual(subtotal);
  }
});
