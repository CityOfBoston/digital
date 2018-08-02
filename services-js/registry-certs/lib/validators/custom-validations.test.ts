import {
  validateTelephone,
  validateUsState,
  validateUsZip,
} from './custom-validations';

describe('validateTelephone', () => {
  it('accepts a telephone number with dashes', () => {
    expect(validateTelephone('123-456-7890')).toEqual(true);
  });

  it('accepts a telephone number without any separators', () => {
    expect(validateTelephone('1234567890')).toEqual(true);
  });

  it('accepts a telephone number with spaces and dashes', () => {
    expect(validateTelephone('123 456-7890')).toEqual(true);
  });

  it('accepts a telephone number with a leading +1', () => {
    expect(validateTelephone('+11234567890')).toEqual(true);
  });

  it('accepts a telephone number with a leading +1 and spaces', () => {
    expect(validateTelephone('+1 123 456 7890')).toEqual(true);
  });

  it('accepts a telephone number with parens around the area code', () => {
    expect(validateTelephone('+1 (123) 456-7890')).toEqual(true);
  });

  it('rejects a telephone number without enough numbers', () => {
    expect(validateTelephone('123456')).toEqual(false);
  });

  it('rejects a telephone number with too many numbers', () => {
    expect(validateTelephone('123456789012345')).toEqual(false);
  });

  it('rejects a telephone number with the spaces in the wrong places', () => {
    expect(validateTelephone('1 23456789 0')).toEqual(false);
  });
});

describe('validateUsState', () => {
  it('accepts a state', () => {
    expect(validateUsState('MA')).toEqual(true);
  });

  it('accepts a territory', () => {
    expect(validateUsState('PR')).toEqual(true);
  });

  it('rejects something else', () => {
    expect(validateUsState('AA')).toEqual(false);
  });
});

describe('validateUsZip', () => {
  it('accepts a five-digit code', () => {
    expect(validateUsZip('01776')).toEqual(true);
  });

  it('accepts a nine-digit code', () => {
    expect(validateUsZip('01776-1111')).toEqual(true);
  });

  it('rejects not enough numbers', () => {
    expect(validateUsZip('123')).toEqual(false);
  });

  it('rejects too many numbers', () => {
    expect(validateUsZip('1234567')).toEqual(false);
  });
});
