import { analyzePassword, testNotCityEmailAddress } from './validation';

describe('analyzePassword', () => {
  test('long enough', () => {
    expect(analyzePassword('a').longEnough).toBe(false);
    expect(analyzePassword('abcdeabcde').longEnough).toBe(true);
  });

  test('has lowercase', () => {
    expect(analyzePassword('abc').hasLowercase).toBe(true);
    expect(analyzePassword('ABC').hasLowercase).toBe(false);
  });

  test('has uppercase', () => {
    expect(analyzePassword('ABC').hasUppercase).toBe(true);
    expect(analyzePassword('abc').hasUppercase).toBe(false);
  });

  test('has number', () => {
    expect(analyzePassword('123').hasNumber).toBe(true);
    expect(analyzePassword('abc').hasUppercase).toBe(false);
  });

  test('has symbol', () => {
    expect(analyzePassword('_').hasSymbol).toBe(true);
    expect(analyzePassword('#').hasSymbol).toBe(true);
    expect(analyzePassword('aB4').hasSymbol).toBe(false);
    expect(analyzePassword('    ').hasSymbol).toBe(false);
  });

  test('complex enough', () => {
    expect(analyzePassword('____').complexEnough).toBe(false);
    expect(analyzePassword('__33').complexEnough).toBe(false);
    expect(analyzePassword('_a33').complexEnough).toBe(true);
    expect(analyzePassword('_a3B').complexEnough).toBe(true);
  });

  test('too long', () => {
    expect(analyzePassword('12345678901234567890123456789012345').tooLong).toBe(
      true
    );
    expect(analyzePassword('abc').tooLong).toBe(false);
  });

  test('has spaces', () => {
    expect(analyzePassword('a b').hasSpaces).toBe(true);
    expect(analyzePassword('abc').hasSpaces).toBe(false);
  });
});

describe('testNotCityEmailAddress', () => {
  test('GMail', () => {
    expect(testNotCityEmailAddress('test@gmail.com')).toBe(true);
  });

  test('Boston.gov', () => {
    expect(testNotCityEmailAddress('test@boston.gov')).toBe(false);
  });

  test('BOSTON.GOV', () => {
    expect(testNotCityEmailAddress('test@BOSTON.GOV')).toBe(false);
  });

  test('Boston.gov subdomain', () => {
    expect(testNotCityEmailAddress('test@staging.boston.gov')).toBe(false);
  });

  test('Notboston.gov', () => {
    expect(testNotCityEmailAddress('test@notboston.gov')).toBe(true);
  });

  test('cityofboston.gov', () => {
    expect(testNotCityEmailAddress('test@cityofboston.gov')).toBe(false);
  });
});
