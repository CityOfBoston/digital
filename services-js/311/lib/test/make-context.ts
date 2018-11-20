import { NextContext } from '@cityofboston/next-client-common';

/**
 * Test helper to make a `getInitialProps` context that matches what Next.js
 * will provide on the server-side.
 */
export function makeServerContext(
  pathname: string,
  query: { [key: string]: string } = {}
): NextContext {
  const req: any = {};

  return {
    req,
    res: { statusCode: 200 } as any,
    err: null,
    pathname,
    asPath: pathname,
    query,
  };
}

/**
 * Test helper to make a `getInitialProps` context that matches what Next.js
 * will provide on the client-side.
 */
export function makeBrowserContext(
  pathname: string,
  query: { [key: string]: string } = {}
): NextContext {
  // TODO(finh): could include xhr if anyone needs it
  return {
    req: undefined,
    res: undefined,
    pathname,
    asPath: pathname,
    err: null,
    query,
  };
}
