// @flow

export const CERTIFICATE_COST = 14 * 100;
export const FIXED_SERVICE_FEE = 25;
export const PERCENTAGE_SERVICE_FEE = 0.021;

// Used to describe the percentage when you have to take into account your own
// percentage.
const PERCENT_OF_TOTAL = 1 / (1 - PERCENTAGE_SERVICE_FEE) - 1;

export const CERTIFICATE_COST_STRING = `$${(CERTIFICATE_COST / 100).toFixed(
  2
)}`;
export const PERCENTAGE_STRING = `${(Math.round(PERCENT_OF_TOTAL * 10000) / 100
).toFixed(2)}%`;
export const FIXED_STRING = `$${(FIXED_SERVICE_FEE / 100).toFixed(2)}`;

export function calculateCost(quantity: number) {
  const subtotal = quantity * CERTIFICATE_COST;

  // Math: https://support.stripe.com/questions/can-i-charge-my-stripe-fees-to-my-customers
  const total = Math.round(
    (subtotal + FIXED_SERVICE_FEE) / (1 - PERCENTAGE_SERVICE_FEE)
  );

  const serviceFee = total - subtotal;

  return {
    subtotal,
    serviceFee,
    total,
  };
}
