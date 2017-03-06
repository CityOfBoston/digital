// @flow

import getStore from '.';
import inBrowser from '../../lib/test/in-browser';

describe('getStore', () => {
  it('returns the same instance twice in browser', async () => {
    await inBrowser(() => {
      const store = getStore();
      expect(getStore()).toBe(store);
    });
  });

  it('returns different instances on the server', () => {
    const store = getStore();
    expect(getStore()).not.toBe(store);
  });

  it('initializes with an initial state', () => {
    const initialState = {
      keys: {
        googleApi: 'key',
      },
      request: {
        address: '',
        attributes: {},
        code: '',
        description: 'initial description',
        email: '',
        firstName: '',
        lastName: '',
        location: null,
        phone: '',
      },
      services: {
        cache: {},
      },
    };
    const store = getStore(initialState);
    expect(store.getState()).toEqual(initialState);
  });
});
