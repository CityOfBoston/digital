import { PHONE_REGEXP } from './form-common';

describe('PHONE_REGEXP', () => {
  it('handles no punctuation', () => {
    expect('6175551234').toMatch(PHONE_REGEXP);
  });

  it('handles international number with punctuation', () => {
    expect('+1 (617) 555-1234').toMatch(PHONE_REGEXP);
  });

  it('requires an area code', () => {
    expect('555-1234').not.toMatch(PHONE_REGEXP);
  });
});
