// @flow

import type { Context } from 'next';
import type { RequestAdditions } from '../../server/next-handlers';

/**
 * Test helper to make a `getInitialProps` context that matches what Next.js
 * will provide on the server-side.
 */
export function makeServerContext(pathname: string, query: {[key: string]: string} = {}): Context<RequestAdditions> {
  const req: RequestAdditions = {
    newRelicScript: '',
    hapiInject: () => { throw new Error('hapiInject is not supported in tests'); },
    apiKeys: {
      google: 'FAKE_GOOGLE_API_KEY',
    },
  };

  return {
    req: (req: any),
    res: (({ statusCode: 200 }): any),
    pathname,
    query,
  };
}

/**
 * Test helper to make a `getInitialProps` context that matches what Next.js
 * will provide on the client-side.
 */
export function makeBrowserContext(pathname: string, query: {[key: string]: string} = {}): Context<RequestAdditions> {
  // TODO(finh): could include xhr if anyone needs it
  return {
    req: null,
    res: null,
    pathname,
    query,
  };
}
