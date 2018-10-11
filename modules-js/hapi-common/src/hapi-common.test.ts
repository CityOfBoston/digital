import { Server } from 'hapi';

import {
  headerKeys,
  HeaderKeysOptions,
  graphqlOptionsWithRollbar,
} from './hapi-common';

const AUTH_HEADER = 'X-API-KEY';
const ALLOWED_KEYS = ['key-1', 'key-2'];

describe('headerKeys', () => {
  let server;

  beforeEach(() => {
    server = new Server();

    server.auth.scheme('headerKeys', headerKeys);
    server.auth.strategy('testHeaderKeys', 'headerKeys', {
      header: AUTH_HEADER,
      keys: ALLOWED_KEYS,
    } as HeaderKeysOptions);

    server.route({
      method: 'GET',
      path: '/test',
      handler: () => 'ok',
      options: {
        auth: 'testHeaderKeys',
      },
    });
  });

  it('fails authentication if there’s no header', async () => {
    const resp = await server.inject({ url: '/test' });
    expect(resp.statusCode).toEqual(401);
  });

  it('fails authentication if the key isn’t in the list', async () => {
    const resp = await server.inject({
      url: '/test',
      headers: { [AUTH_HEADER]: 'key-3' },
    });
    expect(resp.statusCode).toEqual(401);
  });

  it('succeeds when the key is in the list', async () => {
    const resp = await server.inject({
      url: '/test',
      headers: { [AUTH_HEADER]: 'key-1' },
    });
    expect(resp.statusCode).toEqual(200);
  });
});

describe('graphqlOptionsWithRollbar', () => {
  let rollbar: any;

  beforeEach(() => {
    rollbar = {
      error: jest.fn(),
    };
  });

  describe('rollbarWrapGraphqlOptions', () => {
    it('sends context creation errors to rollbar', () => {
      const err = new Error();
      const fn = graphqlOptionsWithRollbar(rollbar, () => {
        throw err;
      });

      expect(fn({} as any)).rejects.toBe(err);
      expect(rollbar.error).toHaveBeenCalledWith(err);
    });

    it('sends format error exceptions to rollbar', async () => {
      const hapiRequest: any = {
        raw: {
          req: {},
          res: {},
        },
      };

      const opts = await graphqlOptionsWithRollbar(rollbar, () => ({
        formatError: e => e,
      }))(hapiRequest);

      const err = new Error();
      const graphQlError: any = new Error();
      graphQlError.originalError = err;

      const out = opts.formatError(graphQlError);

      expect(out).toBe(graphQlError);
      expect(rollbar.error).toHaveBeenCalledWith(
        err,
        hapiRequest.raw.req,
        expect.anything()
      );
    });
  });
});
