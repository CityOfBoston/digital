import makePaymentValidator from './PaymentValidator';

const EMPTY_FORM = {
  cardholderName: '',

  billingAddressSameAsShippingAddress: true,

  billingAddress1: '',
  billingAddress2: '',
  billingCity: '',
  billingState: '',
  billingZip: '',
};

describe('PaymentValidator', () => {
  it('does not require when shipping is the same', () => {
    const validator = makePaymentValidator(EMPTY_FORM);
    validator.check();
    expect(validator.errors.get('billingAddress1')).toEqual([]);
  });

  it('does require when shipping is different', () => {
    const validator = makePaymentValidator({
      ...EMPTY_FORM,
      billingAddressSameAsShippingAddress: false,
    });
    validator.check();
    expect(validator.errors.get('billingAddress1')).toEqual([
      'The address line field is required.',
    ]);
  });

  it('validates state', () => {
    const validator = makePaymentValidator({
      ...EMPTY_FORM,
      billingAddressSameAsShippingAddress: false,
      billingState: '??',
    });
    validator.check();
    expect(validator.errors.get('billingState')).toEqual([
      'This state is not a recognized state abbreviation.',
    ]);
  });
});
