/**
 * @jest-environment node
 *
 * no flow in this file because of the way we mess with console.log
 */

/* eslint no-console: 0 */

import { makeServer } from './server';

// We don't want to try and actually connect to the INovah endpoint, which
// happens on server startup.
jest.mock('./services/INovah');

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

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

    const out = makeServer({ opbeat });
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
