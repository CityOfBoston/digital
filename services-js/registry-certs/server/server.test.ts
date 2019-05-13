/* eslint no-console: 0 */

import { makeServer } from './server';
import { Server } from 'hapi';
import Stripe from 'stripe';

jest.mock('stripe');

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

const API_KEY = 'test-api-key';
const FULFILLMENT_API_KEY = 'fulfillment-api-key';

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

let rollbar;

// Needs to be "beforeAll" not "beforeEach" so that we don’t create new ones
// with each test, since the server object holds on to the original ones.
beforeAll(() => {
  rollbar = {
    error: jest.fn(),
  };
});

describe('server', () => {
  it('can be created', async () => {
    const { server } = await makeServer({ rollbar });
    expect(server).toBeDefined();
  });
});

describe('running server', () => {
  let server: Server;
  let shutdown: () => void;

  beforeAll(async () => {
    (Stripe as any).mockImplementation(() => ({
      charges: {
        retrieve: jest.fn().mockReturnValue(Promise.resolve({})),
        refund: jest.fn().mockReturnValue(Promise.resolve({})),
      },
    }));

    const oldLog = console.log;
    console.log = () => {};

    process.env.API_KEYS = API_KEY;
    process.env.FULFILLMENT_API_KEY = FULFILLMENT_API_KEY;

    // Keeps us from colliding with other servers that might be running
    process.env.PORT = '0';

    const out = await makeServer({ rollbar });
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
      expect(JSON.parse(resp.payload)).toMatchSnapshot();
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

    // We test this specially because they’re a bit of a pain to do manually.
    it('handles persisted queries', async () => {
      const resp = await server.inject({
        method: 'POST',
        url: '/graphql',
        headers: {
          'X-API-KEY': FULFILLMENT_API_KEY,
        },
        payload: {
          id: 'cancel-bc-order-v1',
          variables: {
            orderId: 'test-order-id',
            transactionId: 'test-transaction-id',
          },
        },
      });

      expect(resp.statusCode).toEqual(200);

      const out = JSON.parse(resp.payload);
      expect(out).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "cancelOrder": Object {
              "error": null,
              "success": true,
            },
          },
        }
      `);
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
