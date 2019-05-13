/* eslint no-console: 0 */
import { makeServer } from './commissions-app';
import { Server } from 'hapi';

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

const PATH_PREFIX = '/commissions';
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

describe('server creation', () => {
  it('can be created', async () => {
    const { server } = await makeServer(0, null as any);
    expect(server).toBeDefined();
  });
});

describe('server', () => {
  let server: Server;
  let shutdown;

  beforeAll(async () => {
    const oldLog = console.log;
    console.log = () => {};

    process.env.API_KEYS = API_KEY;

    const out = await makeServer(0, null as any);
    server = out.server;
    const startup = out.startup;

    shutdown = await startup();
    console.log = oldLog;
  });

  afterAll(async () => {
    await shutdown();
  });

  it('passes healthcheck', async () => {
    const resp = await server.inject({
      method: 'GET',
      url: '/admin/ok',
    });

    expect(resp.statusCode).toEqual(200);
  });

  it('handles GraphQL query', async () => {
    const resp = await server.inject({
      method: 'POST',
      url: `${PATH_PREFIX}/graphql`,
      headers: {
        'X-API-KEY': API_KEY,
      },
      payload: GRAPHQL_INTROSPECTION_PAYLOAD,
    });

    expect(resp.statusCode).toEqual(200);
    expect(JSON.parse(resp.payload)).toMatchSnapshot();
  });
});
