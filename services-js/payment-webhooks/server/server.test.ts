/**
 * @jest-environment node
 */

/* eslint no-console: 0 */

import { makeServer } from './server';

// We don't want to try and actually connect to the INovah endpoint, which
// happens on server startup.
jest.mock('./services/INovah');

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

let rollbar;

beforeEach(() => {
  rollbar = {};
});

describe('server', () => {
  it('can be created', async () => {
    const { server } = await makeServer({ rollbar });
    expect(server).toBeDefined();
  });
});

describe('running server', () => {
  let server;
  let shutdown;

  beforeAll(async () => {
    const oldLog = console.log;
    console.log = () => {};

    const out = await makeServer({ rollbar });
    server = out.server;
    const startup = out.startup;

    shutdown = await startup();
    console.log = oldLog;
  });

  afterAll(async () => {
    await shutdown();
  });

  describe('health check', () => {
    it('handles request', async () => {
      const resp = await server.inject({
        method: 'GET',
        url: '/admin/ok',
      });
      expect(resp.statusCode).toEqual(200);
    });
  });
});
