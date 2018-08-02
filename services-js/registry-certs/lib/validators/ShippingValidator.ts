import Validator from 'validatorjs';

import './custom-validations';

// matches part of store/Order.js’s OrderInfo
interface ShippingFields {
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

const RULES = {
  contactName: 'required|string',
  contactEmail: 'required|email',
  contactPhone: 'required|telephone',

  shippingName: 'required|string',
  shippingCompanyName: 'string',
  shippingAddress1: 'required|string',
  shippingAddress2: 'string',
  shippingCity: 'required|string',
  shippingState: 'required|us-state',
  shippingZip: 'required|us-zip',
};

const NAMES = {
  contactName: 'full name',
  contactEmail: 'email address',
  contactPhone: 'phone number',

  shippingName: 'full name',
  shippingCompanyName: 'company name',
  shippingAddress1: 'address line',
  shippingAddress2: 'address line',
  shippingCity: 'city',
  shippingState: 'state',
  shippingZip: 'ZIP code',
};

export type ShippingValidator = Validator<typeof RULES>;

export default function makeValidator(
  fields: ShippingFields
): ShippingValidator {
  const validator = new Validator(fields, RULES);
  validator.setAttributeNames(NAMES);
  return validator;
}
