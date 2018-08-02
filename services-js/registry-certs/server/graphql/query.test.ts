import { resolvers } from './query';

describe('Query resolvers', () => {
  describe('deathCertificates', () => {
    it('returns an empty value', () => {
      expect(resolvers.Query.deathCertificates()).toEqual({});
    });
  });
});
