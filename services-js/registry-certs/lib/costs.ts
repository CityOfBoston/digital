// All costs are in cents, which is how Stripe does things.

export const DEATH_CERTIFICATE_COST = 14 * 100;

// CC == "credit card"
export const FIXED_CC_SERVICE_FEE = 25;
export const PERCENTAGE_CC_SERVICE_FEE = 0.021;

// DC == "debit card"
export const FIXED_DC_SERVICE_FEE = 25;
export const PERCENTAGE_DC_SERVICE_FEE = 0.015;

// Used to describe the percentage when you have to take into account your own
// percentage.
const CC_PERCENT_OF_TOTAL = 1 / (1 - PERCENTAGE_CC_SERVICE_FEE) - 1;

export const DEATH_CERTIFICATE_COST_STRING = `$${(
  DEATH_CERTIFICATE_COST / 100
).toFixed(2)}`;
export const PERCENTAGE_CC_STRING = `${(
  Math.round(CC_PERCENT_OF_TOTAL * 10000) / 100
).toFixed(2)}%`;
export const FIXED_CC_STRING = `$${(FIXED_CC_SERVICE_FEE / 100).toFixed(2)}`;

export const SERVICE_FEE_URI = 'https://www.cityofboston.gov/payments/faqs.asp';

export function calculateCreditCardCost(eachCost: number, quantity: number) {
  return calculateCost(
    eachCost,
    quantity,
    FIXED_CC_SERVICE_FEE,
    PERCENTAGE_CC_SERVICE_FEE
  );
}

export function calculateDebitCardCost(eachCost: number, quantity: number) {
  return calculateCost(
    eachCost,
    quantity,
    FIXED_DC_SERVICE_FEE,
    PERCENTAGE_DC_SERVICE_FEE
  );
}

export function calculateCost(
  eachCost: number,
  quantity: number,
  fixedCost: number,
  percentageCost: number
) {
  const subtotal = quantity * eachCost;

  // Math: https://support.stripe.com/questions/can-i-charge-my-stripe-fees-to-my-customers
  const total = Math.round((subtotal + fixedCost) / (1 - percentageCost));

  const serviceFee = total - subtotal;

  return {
    subtotal,
    serviceFee,
    total,
  };
}
