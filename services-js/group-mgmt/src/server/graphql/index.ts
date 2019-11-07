export type Source = 'web' | 'fulfillment' | 'unknown';

export interface Context {
  source: Source;
}
