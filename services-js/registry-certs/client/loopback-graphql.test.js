// @flow

import fetchMock from 'fetch-mock';
import inBrowser from '../lib/test/in-browser';

import makeLoopbackGraphql from './loopback-graphql';

// Tests to somewhat exercise the loopback graphql code. Note though that these
// are making untested integration assumptions about how the GraphQL server
// and the hapiInject behavior will succeed and fail.

afterEach(fetchMock.restore);

describe('client mode', () => {
  let loopbackGraphql;

  beforeEach(() => {
    inBrowser(() => {
      // eslint-disable-next-line no-underscore-dangle
      window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
      loopbackGraphql = makeLoopbackGraphql();
    });
  });

  test('success case', async () => {
    fetchMock.post('/graphql', {
      body: {
        data: {
          key: 'value',
        },
      },
    });

    const queryPromise = loopbackGraphql('query', { arg: 'value' });
    expect(fetchMock.lastOptions().body).toEqual(
      '{"query":"query","variables":{"arg":"value"}}',
    );
    expect(await queryPromise).toEqual({ key: 'value' });
  });

  test('GraphQL failure case', async () => {
    // to be sure that `await` throws error and `expect` has been called once
    expect.assertions(1);

    fetchMock.post('/graphql', {
      body: {
        data: {
          query: null,
        },
        errors: [{ message: 'Unexpected error' }],
      },
    });

    try {
      await loopbackGraphql('query', { arg: 'value' });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  test('server failure case', async () => {
    // to be sure that `await` throws error and `expect` has been called once
    expect.assertions(1);

    fetchMock.post('/graphql', {
      status: 500,
      body: 'Everything is broken',
    });

    try {
      await loopbackGraphql('query', { arg: 'value' });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  test('network failure case', async () => {
    // to be sure that `await` throws error and `expect` has been called once
    expect.assertions(1);

    fetchMock.post('/graphql', {
      throws: new TypeError('connecting blew up'),
    });

    try {
      await loopbackGraphql('query', { arg: 'value' });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });
});

describe('server getInitialProps mode', () => {
  let loopbackGraphql;
  let hapiInject;
  let resolveHapiInject;
  let rejectHapiInject;

  beforeEach(() => {
    hapiInject = jest.fn().mockReturnValue(
      new Promise((resolve, reject) => {
        resolveHapiInject = resolve;
        rejectHapiInject = reject;
      }),
    );

    const req: any = { hapiInject };
    loopbackGraphql = makeLoopbackGraphql(req);
  });

  test('success case', async () => {
    const queryPromise = loopbackGraphql('query', { arg: 'value' });

    expect(hapiInject).toHaveBeenCalledWith({
      method: 'post',
      headers: {
        'X-API-KEY': '',
      },
      payload: { query: 'query', variables: { arg: 'value' } },
      url: '/graphql',
    });

    resolveHapiInject({
      statusCode: 200,
      result: '{"data": {"key": "value"}}',
    });

    expect(await queryPromise).toEqual({ key: 'value' });
  });

  test('failure case', async () => {
    // to be sure that `await` throws error and `expect` has been called once
    expect.assertions(1);

    const error: Object = new Error('GraphQL error');
    error.errors = [{ message: 'There was an error' }];

    rejectHapiInject(error);

    try {
      await loopbackGraphql('query', { arg: 'value' });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });
});

describe('server render mode', () => {
  it('errors out if used during server render', () => {
    const loopbackGraphql = makeLoopbackGraphql();
    expect(() => loopbackGraphql('query')).toThrowErrorMatchingSnapshot();
  });
});
