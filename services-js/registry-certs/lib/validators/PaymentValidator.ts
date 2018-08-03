import Validator from 'validatorjs';

import './custom-validations';

// matches part of store/Order.js’s OrderInfo
interface PaymentFields {
  cardholderName: string;
  billingAddressSameAsShippingAddress: boolean;

  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
}

const ADDRESS_REQUIRED_RULE = {
  required_unless: ['billingAddressSameAsShippingAddress', true],
};

const RULES = {
  cardholderName: 'required|string',
  billingAddressSameAsShippingAddress: 'boolean',

  billingAddress1: [ADDRESS_REQUIRED_RULE, 'string'],
  billingAddress2: 'string',
  billingCity: [ADDRESS_REQUIRED_RULE, 'string'],
  billingState: [ADDRESS_REQUIRED_RULE, 'us-state'],
  billingZip: [ADDRESS_REQUIRED_RULE, 'us-zip'],
};

const NAMES = {
  cardholderName: 'name',
  billingAddressSameAsShippingAddress: 'checkbox',

  billingAddress1: 'address line',
  billingAddress2: 'address line',
  billingCity: 'city',
  billingState: 'state',
  billingZip: 'ZIP code',
};

export type PaymentValidator = Validator<typeof RULES>;

export default function makeValidator(fields: PaymentFields): PaymentValidator {
  const validator = new Validator(fields, RULES, {
    required_unless: 'The :attribute field is required.',
  });
  validator.setAttributeNames(NAMES);
  return validator;
}
