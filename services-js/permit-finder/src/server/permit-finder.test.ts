/* eslint no-console: 0 */
import { makeServer } from './permit-finder';

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

const API_KEY = 'test-api-key';

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'info').mockImplementation();
jest.spyOn(console, 'time').mockImplementation();
jest.spyOn(console, 'timeEnd').mockImplementation();

describe('server creation', () => {
  it('can be created', async () => {
    const { server } = await makeServer(0, null as any);
    expect(server).toBeDefined();
  });
});

describe('server', () => {
  let server;
  let shutdown;

  beforeAll(async () => {
    process.env.API_KEYS = API_KEY;

    const out = await makeServer(0, null as any);
    server = out.server;
    const startup = out.startup;

    shutdown = await startup();
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

  it('handles GraphQL requests', async () => {
    const resp = await server.inject({
      method: 'POST',
      url: '/graphql',
      headers: {
        'X-API-KEY': API_KEY,
      },
      payload: `
      query {
        permit(permitNumber: "X49106288") {
          kind
          type
          milestones {
            milestoneName
          }
          reviews {
            type
          }
        }
      }
      `,
    });

    expect(JSON.parse(resp.payload)).toMatchInlineSnapshot(`
      Object {
        "error": "Bad Request",
        "message": "Invalid request payload JSON format",
        "statusCode": 400,
      }
    `);
  });
});
