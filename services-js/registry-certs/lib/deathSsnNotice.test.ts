import {
  isDeathBeforeSsnCutoff,
  DEATH_SSN_CUTOFF,
} from './deathSsnNotice';

describe('isDeathBeforeSsnCutoff', () => {
  it('returns true for full dates before the cutoff', () => {
    expect(isDeathBeforeSsnCutoff('05/03/1949')).toBe(true);
    expect(isDeathBeforeSsnCutoff('12/31/1977')).toBe(true);
    expect(isDeathBeforeSsnCutoff('1/1/1977')).toBe(true);
  });

  it('returns false for the cutoff date and after', () => {
    expect(
      isDeathBeforeSsnCutoff(
        `${DEATH_SSN_CUTOFF.month}/${DEATH_SSN_CUTOFF.day}/${
          DEATH_SSN_CUTOFF.year
        }`
      )
    ).toBe(false);
    expect(isDeathBeforeSsnCutoff('1/1/1978')).toBe(false);
    expect(isDeathBeforeSsnCutoff('02/16/2025')).toBe(false);
    expect(isDeathBeforeSsnCutoff('3/4/2016')).toBe(false);
  });

  it('falls back to deathYear when deathDate is missing', () => {
    expect(isDeathBeforeSsnCutoff(null, '1977')).toBe(true);
    expect(isDeathBeforeSsnCutoff(null, '1978')).toBe(false);
    expect(isDeathBeforeSsnCutoff(undefined, '2004')).toBe(false);
  });

  it('prefers deathDate over deathYear', () => {
    expect(isDeathBeforeSsnCutoff('12/31/1977', '1978')).toBe(true);
    expect(isDeathBeforeSsnCutoff('1/1/1978', '1977')).toBe(false);
  });

  it('returns false when neither date nor year can be parsed', () => {
    expect(isDeathBeforeSsnCutoff(null, null)).toBe(false);
    expect(isDeathBeforeSsnCutoff('', '')).toBe(false);
    expect(isDeathBeforeSsnCutoff('not-a-date', 'abcd')).toBe(false);
  });
});
