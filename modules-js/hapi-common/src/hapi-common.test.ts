import { Server } from 'hapi';

import {
  headerKeys,
  HeaderKeysOptions,
  graphqlOptionsWithRollbar,
} from './hapi-common';

const AUTH_HEADER = 'X-API-KEY';
const ALLOWED_KEYS = ['key-1', 'key-2'];

describe('headerKeys', () => {
  const makeServer = (keys): Server => {
    const server = new Server();

    server.auth.scheme('headerKeys', headerKeys);
    server.auth.strategy('testHeaderKeys', 'headerKeys', {
      header: AUTH_HEADER,
      keys,
    } as HeaderKeysOptions);

    server.route({
      method: 'GET',
      path: '/test',
      handler: ({ auth }) => auth.credentials,
      options: {
        auth: 'testHeaderKeys',
      },
    });

    return server;
  };
  it('fails authentication if there’s no header', async () => {
    const server = makeServer(ALLOWED_KEYS);
    const resp = await server.inject({ url: '/test' });
    expect(resp.statusCode).toEqual(401);
  });

  it('fails authentication if the key isn’t in the list', async () => {
    const server = makeServer(ALLOWED_KEYS);
    const resp = await server.inject({
      url: '/test',
      headers: { [AUTH_HEADER]: 'key-3' },
    });
    expect(resp.statusCode).toEqual(401);
  });

  it('succeeds when the key is in the list', async () => {
    const server = makeServer(ALLOWED_KEYS);
    const resp = await server.inject({
      url: '/test',
      headers: { [AUTH_HEADER]: 'key-1' },
    });
    expect(resp.statusCode).toEqual(200);
    expect(JSON.parse(resp.payload)).toMatchObject({ key: 'key-1' });
  });

  it('succeeds when the keys are a map of credentials', async () => {
    const server = makeServer({
      'key-1': { source: 'fulfillment' },
    });

    const resp = await server.inject({
      url: '/test',
      headers: { [AUTH_HEADER]: 'key-1' },
    });

    expect(resp.statusCode).toEqual(200);
    expect(JSON.parse(resp.payload)).toMatchObject({
      key: 'key-1',
      source: 'fulfillment',
    });
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
