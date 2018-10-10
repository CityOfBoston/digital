/* eslint no-console: 0 */
import { makeServer } from './access-boston';

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

const API_KEY = 'test-api-key';

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
});
