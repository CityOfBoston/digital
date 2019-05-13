import { Server } from 'hapi';
import Boom from 'boom';
import { GraphQLExtension } from 'graphql-extensions';

import {
  headerKeys,
  HeaderKeysOptions,
  rollbarErrorExtension,
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

describe('rollbarErrorExtension', () => {
  let rollbar: any;
  let extension: GraphQLExtension;

  beforeEach(() => {
    rollbar = {
      error: jest.fn(),
    };

    extension = rollbarErrorExtension(rollbar)();
  });

  it('sends exceptions to Rollbar', async () => {
    const hapiRequest: any = {
      raw: {
        req: {},
        res: {},
      },
    };

    extension.requestDidStart!({
      request: {},
      queryString: 'test query',
      variables: { id: 5 },
    } as any);

    const err = new Error();
    const graphQlError: any = new Error();
    graphQlError.originalError = err;

    extension.didEncounterErrors!([graphQlError]);

    expect(rollbar.error).toHaveBeenCalledWith(err, hapiRequest.raw.req, {
      custom: {},
      graphql: {
        query: 'test query',
        variables: { id: 5 },
      },
    });
  });

  it('includes Boom data in GQL exceptions', async () => {
    extension.requestDidStart!({
      request: { url: '/graphql' },
      queryString: 'test query',
      variables: { id: 5 },
    } as any);

    const err = Boom.forbidden('Forbidden', { extraInfo: 'it blew up' });
    const graphQlError: any = new Error();
    graphQlError.originalError = err;

    extension.didEncounterErrors!([graphQlError]);

    expect(rollbar.error).toHaveBeenCalledWith(
      err,
      { url: '/graphql' },
      {
        custom: {
          data: {
            extraInfo: 'it blew up',
          },
        },
        graphql: {
          query: 'test query',
          variables: { id: 5 },
        },
      }
    );
  });
});
