// @flow

export const CERTIFICATE_COST = 14 * 100;
export const FIXED_SERVICE_FEE = 30;
export const PERCENTAGE_SERVICE_FEE = 0.029;

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
