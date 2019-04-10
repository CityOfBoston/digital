import { normalizePhoneNumber } from './Open311';

describe('normalize phone number', () => {
  it('strips all punctuation and whitespace', () => {
    expect(normalizePhoneNumber('+1 (617) 555-1234')).toBe('+16175551234');
  });
});
