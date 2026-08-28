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
