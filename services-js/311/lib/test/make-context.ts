import { Context } from 'next';
import { RequestAdditions } from '../../server/next-handlers';

/**
 * Test helper to make a `getInitialProps` context that matches what Next.js
 * will provide on the server-side.
 */
export function makeServerContext(
  pathname: string,
  query: { [key: string]: string } = {},
  requestAdditions: any = {}
): Context<RequestAdditions> {
  const req: any = {
    hapiInject: () => {
      throw new Error('hapiInject is not supported in tests');
    },
    apiKeys: {
      mapbox: {
        accessToken: 'FAKE_MAPBOX_ACCESS_TOKEN',
      },
    },

    ...requestAdditions,
  };

  return {
    req: req as any,
    res: { statusCode: 200 } as any,
    pathname,
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
): Context<RequestAdditions> {
  // TODO(finh): could include xhr if anyone needs it
  return {
    req: null,
    res: null,
    pathname,
    query,
  };
}
