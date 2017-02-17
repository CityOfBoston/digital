// @flow

import type { Context } from 'next';
import { makeStore } from '../../data/store';
import { setKeys } from '../../data/store/keys';
import type { RequestAdditions } from '../../server/next-handlers';

/**
 * Test helper to make a `getInitialProps` context that matches what Next.js
 * will provide on the server-side.
 */
export function makeServerContext(pathname: string, query: {[key: string]: string} = {}): Context<RequestAdditions> {
  const store = makeStore();
  store.dispatch(setKeys({
    googleApi: 'FAKE_GOOGLE_API_KEY',
  }));

  const req: RequestAdditions = {
    hapiInject: () => { throw new Error('hapiInject is not supported in tests'); },
    reduxInitialState: store.getState(),
  };

  return {
  // TODO(finh): could include resp if anyone needs it
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
