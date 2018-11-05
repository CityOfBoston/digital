/**
 * @jest-environment node
 */

/* eslint no-console: 0 */

import 'jest';
import Rollbar from 'rollbar';

import { makeServer } from './server';

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

const port = 8000;
let rollbar: Rollbar;

beforeEach(() => {
  rollbar = new Rollbar({});
});

describe('server', () => {
  it('can be created', async () => {
    const { server } = await makeServer(port, rollbar);
    expect(server).toBeDefined();
  });
});

describe('running server', () => {
  let server;
  let shutdown;

  beforeAll(async () => {
    const oldLog = console.log;
    console.log = () => {};

    const out = await makeServer(port, rollbar);
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
