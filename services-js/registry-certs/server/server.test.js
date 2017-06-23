/**
 * @jest-environment node
 *
 * no flow in this file because of the way we mess with console.log
 */

/* eslint no-console: 0 */

import { makeServer } from './server';

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

jest.mock('watchpack');

const API_KEY = 'test-api-key';
const GRAPHQL_INTROSPECTION_PAYLOAD = {
  query: `
    {
      __schema {
        types {
          name
        }
      }
    }`,
};

let opbeat;

beforeEach(() => {
  opbeat = {};
});

describe('server', () => {
  it('can be created', () => {
    const { server } = makeServer({ opbeat });
    expect(server).toBeDefined();
  });
});

describe('running server', () => {
  let server;
  let shutdown;

  beforeAll(async () => {
    const oldLog = console.log;
    console.log = () => {};

    process.env.API_KEYS = API_KEY;

    const out = makeServer({ opbeat });
    server = out.server;
    const startup = out.startup;

    shutdown = await startup();
    console.log = oldLog;
  });

  afterAll(async () => {
    await shutdown();
  });

  describe('graphql', () => {
    it('handles request', async () => {
      const resp = await server.inject({
        method: 'POST',
        url: '/graphql',
        headers: {
          'X-API-KEY': API_KEY,
        },
        payload: GRAPHQL_INTROSPECTION_PAYLOAD,
      });
      expect(resp.statusCode).toEqual(200);
    });

    it('rejects wrong key', async () => {
      const resp = await server.inject({
        method: 'POST',
        url: '/graphql',
        headers: {
          'X-API-KEY': 'not-a-key',
        },
        payload: GRAPHQL_INTROSPECTION_PAYLOAD,
      });
      expect(resp.statusCode).toEqual(401);
    });

    it('rejects missing auth header', async () => {
      const resp = await server.inject({
        method: 'POST',
        url: '/graphql',
        payload: GRAPHQL_INTROSPECTION_PAYLOAD,
      });
      expect(resp.statusCode).toEqual(401);
    });
  });

  describe('next', () => {
    // Put this in when we have a way for .next changes not to trigger the
    // jest watcher
    // it('loads search page', async () => {
    //   const resp = await server.inject('/death?q=smith');
    //   expect(resp.statusCode).toEqual(200);
    // });
  });
});
