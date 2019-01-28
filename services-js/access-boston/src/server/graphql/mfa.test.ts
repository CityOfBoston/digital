import { stripNonDigits } from './mfa';

describe('stripNonDigits', () => {
  it('preserves just digits', () => {
    expect(stripNonDigits('1234567890')).toBe('1234567890');
  });

  it('deletes other punctuation', () => {
    expect(stripNonDigits('(123) 456-7890')).toBe('1234567890');
  });
});
