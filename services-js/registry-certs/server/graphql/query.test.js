// @flow

import { resolvers } from './query';

describe('Query resolvers', () => {
  describe('four', () => {
    it('returns 4', () => {
      expect(resolvers.Query.four()).toEqual(4);
    });
  });
});
