import { resolvers } from './query';
import { Context } from '.';

describe('Query resolvers', () => {
  describe('deathCertificates', () => {
    it('returns an empty value', () => {
      expect(resolvers.Query.deathCertificates({}, {}, {} as Context)).toEqual(
        {}
      );
    });
  });
});
