import {
  isDeathBeforeSsnCutoff,
  DEATH_SSN_CUTOFF,
  deathFeedbackEmailHtml,
  deathFeedbackIconUrl,
  deathReceiptBelowOrderHtml,
  DEATH_FEEDBACK_FORM_URL,
  DEATH_FEEDBACK_EMAIL_BACKGROUND,
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

describe('death feedback helpers', () => {
  it('builds an absolute icon URL from PUBLIC_HOST', () => {
    expect(deathFeedbackIconUrl('registry.boston.gov')).toBe(
      'https://registry.boston.gov/assets/images/death-sms.svg'
    );
    expect(deathFeedbackIconUrl('https://registry-certs.digital-staging.boston.gov')).toBe(
      'https://registry-certs.digital-staging.boston.gov/assets/images/death-sms.svg'
    );
  });

  it('includes the feedback callout in receipt email HTML', () => {
    const html = deathFeedbackEmailHtml(
      'https://example.com/assets/images/death-sms.svg'
    );
    expect(html).toContain(DEATH_FEEDBACK_EMAIL_BACKGROUND);
    expect(html).toContain(DEATH_FEEDBACK_FORM_URL);
    expect(html).toContain('Help us improve this service');
    expect(html).toContain('Share your feedback');

    const sections = deathReceiptBelowOrderHtml();
    expect(sections[sections.length - 1]).toContain(DEATH_FEEDBACK_FORM_URL);
  });
});
