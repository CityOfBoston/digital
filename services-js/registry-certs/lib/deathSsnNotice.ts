import { SERVICE_FEE_URL } from './costs';

/** Shared label styling for death receipt footer headings (web + email). */
export const DEATH_RECEIPT_LABEL_STYLE = {
  color: '#000',
  fontFamily: 'Lora, Georgia, serif',
  fontSize: '16px',
  fontStyle: 'normal' as const,
  fontWeight: 700,
  lineHeight: '1.2' as const,
};

const EMAIL_LABEL_STYLE =
  'color:#000;font-family:Lora,Georgia,serif;font-size:16px;font-style:normal;font-weight:700;line-height:1.2;';

export const DEATH_SSN_DOCUMENTATION_URL =
  'https://www.boston.gov/departments/registry/how-get-death-certificate#social-security-numbers';

/**
 * SSNs cannot be printed on death certificates for deaths before this date
 * (exclusive of January 1, 1978 itself).
 */
export const DEATH_SSN_CUTOFF = {
  year: 1978,
  month: 1,
  day: 1,
} as const;

export const DEATH_SSN_UNAVAILABLE_COPY =
  'Social Security numbers cannot be printed on death certificates for deaths that occurred before January 1, 1978.';

export const DEATH_SSN_PRE_1978_RECORD_NOTE =
  'This record is from before January 1, 1978.';

const DEATH_DATE_REGEXP = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/;
const DEATH_YEAR_REGEXP = /^\s*(\d{4})\s*$/;

/**
 * True when the decedent’s date of death is before January 1, 1978.
 * Prefers a full `deathDate` (M/D/YYYY); falls back to a 4-digit `deathYear`
 * (year < 1978). Returns false when the date cannot be determined.
 */
export function isDeathBeforeSsnCutoff(
  deathDate: string | null | undefined,
  deathYear?: string | null
): boolean {
  if (deathDate) {
    const match = deathDate.match(DEATH_DATE_REGEXP);
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      const deathUtc = Date.UTC(year, month - 1, day);
      const cutoffUtc = Date.UTC(
        DEATH_SSN_CUTOFF.year,
        DEATH_SSN_CUTOFF.month - 1,
        DEATH_SSN_CUTOFF.day
      );
      return deathUtc < cutoffUtc;
    }
  }

  if (deathYear) {
    const yearMatch = deathYear.match(DEATH_YEAR_REGEXP);
    if (yearMatch) {
      return parseInt(yearMatch[1], 10) < DEATH_SSN_CUTOFF.year;
    }
  }

  return false;
}

/** @deprecated Prefer death receipt footer sections below. */
export const DEATH_SSN_NOTICE_HEADING =
  'Social Security numbers:';

/** @deprecated Prefer death receipt footer sections below. */
export const DEATH_SSN_NOTICE_PARAGRAPH_1 =
  'Under Massachusetts law, standard death certificates are issued with the decedent’s Social Security number masked. If you requested a certificate with the SSN shown, the Registry will review the identity and relationship documents you submitted with your order.';

/** @deprecated Prefer death receipt footer sections below. */
export const DEATH_SSN_NOTICE_PARAGRAPH_2 =
  'If you need to update your request or provide additional information, reply to this email.';

/** @deprecated Prefer deathReceiptBelowOrderHtml(). */
export const DEATH_SSN_NOTICE_INTRO_EMAIL_HTML = `<strong>${DEATH_SSN_NOTICE_HEADING}</strong> ${DEATH_SSN_NOTICE_PARAGRAPH_1}`;

export type DeathReceiptFooterSection = {
  /** When omitted, the body renders as its own unlabeled section. */
  label?: string;
  body: string;
};

export const DEATH_RECEIPT_FOOTER_SECTIONS: DeathReceiptFooterSection[] = [
  {
    label: 'What happens next:',
    body:
      'We’ll either ship your order or follow up with you by email within 2–3 business days.',
  },
  {
    label: 'Need to make a change:',
    body:
      'If you need to update your request or provide additional information, reply to this email.',
  },
  {
    label: 'Social Security numbers:',
    body:
      'Under Massachusetts law, standard death certificates are issued with the decedent’s Social Security number masked.',
  },
  {
    body:
      'If you requested a certificate with the SSN shown, the Registry will review the identity and relationship documents you submitted with your order.',
  },
];

const CARD_SERVICE_FEE_BODY_BEFORE_LINK =
  'A card service fee is added to your order and paid directly to the third-party payment processor. The amount may vary by card type. Learn more about ';
const CARD_SERVICE_FEE_BODY_AFTER_LINK = ' at the City of Boston.';

/** HTML paragraphs for death receipt email (below total). */
export function deathReceiptBelowOrderHtml(
  serviceFeeUri: string = SERVICE_FEE_URL
): string[] {
  const sections = DEATH_RECEIPT_FOOTER_SECTIONS.map(({ label, body }) =>
    label
      ? `<strong style="${EMAIL_LABEL_STYLE}">${label}</strong> ${body}`
      : body
  );

  sections.push(
    `<strong style="${EMAIL_LABEL_STYLE}">Card service fee:</strong> ${CARD_SERVICE_FEE_BODY_BEFORE_LINK}<a href="${serviceFeeUri}" target="_blank" rel="noopener noreferrer" style="color:#1871bd;text-decoration:underline;">card service fees</a>${CARD_SERVICE_FEE_BODY_AFTER_LINK}`
  );

  return sections;
}
