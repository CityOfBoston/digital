/* eslint no-console: 0 */
import { makeServer } from './group-mgmt';

describe('server creation', () => {
  it('can be created', async () => {
    const { server } = await makeServer();
    expect(server).toBeDefined();
  });
});

describe('server', () => {
  let server;
  let shutdown;

  beforeAll(async () => {
    const oldLog = console.log;
    console.log = () => {};

    const out = await makeServer();
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
