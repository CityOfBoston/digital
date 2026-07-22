export type Source = 'web' | 'fulfillment' | 'unknown';

export interface Context {
  source?: Source;
  /** SAML subject / employee id of the logged-in user (from access-boston). */
  userId: string;
  /** Last 6 chars of API token for log correlation (no PII). */
  apiClientId: string;
}
