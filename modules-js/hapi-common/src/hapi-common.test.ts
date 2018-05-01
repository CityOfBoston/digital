import { Server } from 'hapi';

import { headerKeys, HeaderKeysOptions } from './hapi-common';

const AUTH_HEADER = 'X-API-KEY';
const ALLOWED_KEYS = ['key-1', 'key-2'];

describe('headerKeys', () => {
  let server;

  beforeEach(() => {
    server = new Server();

    server.auth.scheme('headerKeys', headerKeys);
    server.auth.strategy('testHeaderKeys', 'headerKeys', {
      header: AUTH_HEADER,
      keys: ALLOWED_KEYS,
    } as HeaderKeysOptions);

    server.route({
      method: 'GET',
      path: '/test',
      handler: () => 'ok',
      options: {
        auth: 'testHeaderKeys',
      },
    });
  });

  it('fails authentication if there’s no header', async () => {
    const resp = await server.inject({ url: '/test' });
    expect(resp.statusCode).toEqual(401);
  });

  it('fails authentication if the key isn’t in the list', async () => {
    const resp = await server.inject({
      url: '/test',
      headers: { [AUTH_HEADER]: 'key-3' },
    });
    expect(resp.statusCode).toEqual(401);
  });

  it('succeeds when the key is in the list', async () => {
    const resp = await server.inject({
      url: '/test',
      headers: { [AUTH_HEADER]: 'key-1' },
    });
    expect(resp.statusCode).toEqual(200);
  });
});
