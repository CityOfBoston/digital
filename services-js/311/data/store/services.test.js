// @flow

import type { Service } from '../types';

import reducer, {
  DEFAULT_STATE,
  addServiceToCache,
} from './services';

const COSMIC_SERVICE: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: true,
  metadata: {
    attributes: [{
      required: false,
      type: 'TEXT',
      code: 'ST-CMTS',
      description: 'Please provide any other relevant information:',
      values: null,
    }],
  },
};


describe('addServiceToCache', () => {
  it('adds the service to the cache', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, addServiceToCache(COSMIC_SERVICE));
    const cache = state.cache;
    expect(cache.CSMCINC).toEqual(COSMIC_SERVICE);
  });
});
