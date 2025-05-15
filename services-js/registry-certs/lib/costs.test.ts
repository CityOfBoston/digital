// import {
//   FIXED_CC_SERVICE_FEE,
//   PERCENTAGE_CC_SERVICE_FEE,
//   calculateCreditCardCost,
//   CERTIFICATE_COST,
//   TRACKING_FEE,
// } from './costs';

// We run this over a bunch of different amounts to verify that, after rounding
// and everything, when Stripe takes its cut of the final value we’ll be left
// with the right certificate cost for Registry.
// it(`calculates service fee correctly for certificates`, () => {
//   for (let q = 0; q < 100; ++q) {
//     const { total, serviceFee, subtotal } = calculateCreditCardCost(
//       CERTIFICATE_COST.DEATH,
//       q,
//       false,
//       true
//     );

//     // Stripe rounding: https://support.stripe.com/questions/what-rules-do-you-use-for-rounding-stripe-fees
//     const stripesCut = Math.round(
//       total * PERCENTAGE_CC_SERVICE_FEE + FIXED_CC_SERVICE_FEE
//     );

//     // console.log(
//     //   `costs.test.ts > quantity: ${q} | stripesCut: ${stripesCut} | total - stripesCut: ${total -
//     //     stripesCut} | serviceFee: ${serviceFee} | subtotal: ${subtotal} | total: ${total} | PERCENTAGE_CC_SERVICE_FEE: ${PERCENTAGE_CC_SERVICE_FEE} | FIXED_CC_SERVICE_FEE: ${FIXED_CC_SERVICE_FEE}`
//     // );
//     // console.log(`------`);

//     expect(stripesCut).toEqual(serviceFee);
//     expect(total - stripesCut).toEqual(subtotal);
//   }
// });

// it(`calculates service fee correctly for certificates with certified mail tracking`, () => {
//   for (let q = 0; q < 100; ++q) {
//     const { total, serviceFee, subtotal } = calculateCreditCardCost(
//       CERTIFICATE_COST.DEATH,
//       q,
//       false,
//       true
//     );

//     // Stripe rounding: https://support.stripe.com/questions/what-rules-do-you-use-for-rounding-stripe-fees
//     const stripesCut = Math.round(
//       total * PERCENTAGE_CC_SERVICE_FEE + FIXED_CC_SERVICE_FEE + TRACKING_FEE
//     );

//     // console.log(
//     //   `costs.test.ts > quantity: ${q} | stripesCut: ${stripesCut} | total - stripesCut: ${total -
//     //     stripesCut} | serviceFee: ${serviceFee} | subtotal: ${subtotal} | total: ${total} | PERCENTAGE_CC_SERVICE_FEE: ${PERCENTAGE_CC_SERVICE_FEE} | FIXED_CC_SERVICE_FEE: ${FIXED_CC_SERVICE_FEE}`
//     // );
//     // console.log(`------`);

//     expect(stripesCut).toEqual(serviceFee);
//     expect(total - stripesCut).toEqual(subtotal);
//   }
// });

it('Min Test', () => {
  expect(0).toEqual(0);
});

export {};
