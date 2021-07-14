// All costs are in cents, which is how Stripe does things.

export const CERTIFICATE_COST = {
  BIRTH: 14 * 100,
  DEATH: 14 * 100,
  MARRIAGE: 14 * 100,
  INTENTION: 14 * 100,
};

export const CERTIFICATE_COST_STRING = {
  BIRTH: certificateCostString(CERTIFICATE_COST.BIRTH),
  DEATH: certificateCostString(CERTIFICATE_COST.DEATH),
  MARRIAGE: certificateCostString(CERTIFICATE_COST.MARRIAGE),
  INTENTION: certificateCostString(CERTIFICATE_COST.INTENTION),
};

// Per-transaction fee for records dated before 1870.
export const RESEARCH_FEE = 10 * 100;

// CC == “credit card”
export const FIXED_CC_SERVICE_FEE = 25;
export const PERCENTAGE_CC_SERVICE_FEE = 0.021;

// DC == “debit card”
export const FIXED_DC_SERVICE_FEE = 25;
export const PERCENTAGE_DC_SERVICE_FEE = 0.015;

// Used to describe the percentage when you have to take into account your own
// percentage.
const CC_PERCENT_OF_TOTAL = 1 / (1 - PERCENTAGE_CC_SERVICE_FEE) - 1;

export const PERCENTAGE_CC_STRING = `${(
  Math.round(CC_PERCENT_OF_TOTAL * 10000) / 100
).toFixed(2)}%`;
export const FIXED_CC_STRING = `$${(FIXED_CC_SERVICE_FEE / 100).toFixed(2)}`;

export const SERVICE_FEE_URL =
  'https://www.boston.gov/common-questions-about-online-payments';

function certificateCostString(certificateCost: number): string {
  return `$${(certificateCost / 100).toFixed(2)}`;
}

// Research fee only applies to records dated before 1870.
export function calculateCreditCardCost(
  eachCost: number,
  quantity: number,
  hasResearchFee?: boolean
) {
  return calculateCost(
    eachCost,
    quantity,
    FIXED_CC_SERVICE_FEE,
    PERCENTAGE_CC_SERVICE_FEE,
    hasResearchFee
  );
}

export function calculateDebitCardCost(
  eachCost: number,
  quantity: number,
  researchFee?: boolean
) {
  return calculateCost(
    eachCost,
    quantity,
    FIXED_DC_SERVICE_FEE,
    PERCENTAGE_DC_SERVICE_FEE,
    researchFee
  );
}

function calculateCost(
  eachCost: number,
  quantity: number,
  fixedCost: number,
  percentageCost: number,
  hasResearchFee: boolean | undefined
) {
  // eslint-disable-next-line no-console
  console.log('-------------');
  const subtotal = quantity * eachCost;
  const researchFee = hasResearchFee ? RESEARCH_FEE : 0;

  // eslint-disable-next-line no-console
  console.log(
    `Prior total: ${(subtotal + fixedCost + researchFee) /
      (1 - percentageCost)}`
  );

  // Math: https://support.stripe.com/questions/can-i-charge-my-stripe-fees-to-my-customers
  const total = Math.round(
    (subtotal + fixedCost + researchFee) / (1 - percentageCost)
  );
  const serviceFee = total - subtotal - researchFee;

  // eslint-disable-next-line no-console
  console.log(`quantity: ${quantity}`);
  // eslint-disable-next-line no-console
  console.log(`eachCost: ${eachCost}`);
  // eslint-disable-next-line no-console
  console.log(`hasResearchFee: ${hasResearchFee}`);
  // eslint-disable-next-line no-console
  console.log(`subtotal: ${subtotal}`);
  // eslint-disable-next-line no-console
  console.log(`fixedCost: ${fixedCost}`);
  // eslint-disable-next-line no-console
  console.log(`researchFee: ${researchFee}`);
  // eslint-disable-next-line no-console
  console.log(`percentageCost: ${percentageCost}`);
  // eslint-disable-next-line no-console
  console.log(`total: ${total}`);
  // eslint-disable-next-line no-console
  console.log('-----');
  // eslint-disable-next-line no-console
  console.log('calculateCost: ', {
    subtotal,
    serviceFee,
    researchFee,
    total,
  });

  // eslint-disable-next-line no-console
  console.log(`subtotal: $${(subtotal / 100).toFixed(2)}`);
  // eslint-disable-next-line no-console
  console.log(`serviceFee: $${(serviceFee / 100).toFixed(2)}`);
  // eslint-disable-next-line no-console
  console.log(`researchFee: $${(researchFee / 100).toFixed(2)}`);
  // eslint-disable-next-line no-console
  console.log(`total: $${(total / 100).toFixed(2)}`);

  return {
    subtotal,
    serviceFee,
    researchFee,
    total,
  };
}
