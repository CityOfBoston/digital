// @flow

import { resolvers } from './death-certificates';
import Registry from '../services/Registry';
import type { SearchResult } from '../services/Registry';

jest.mock('../services/Registry');

const TEST_SEARCH_RESULTS: SearchResult[] = [
  {
    CertificateID: 1,
    'Registered Number': '1001',
    InOut: 'I',
    'First Name': 'LOGAN',
    'Last Name': 'HOWLETT',
    'Decedent Name': 'LOGAN HOWLETT',
    birthYear: '1974',
    'Date of Death': '1/2/2014',
    RegisteredYear: '2014',
    causeOfDeath: 'Adamantium suffocation',
    AgeOrDateOfBirth: '058',
    ResultCount: 3,
  },
  {
    CertificateID: 2,
    'Registered Number': '1004',
    InOut: 'I',
    'First Name': 'BRUCE',
    'Last Name': 'BANNER',
    'Decedent Name': 'BRUCE BANNER',
    birthYear: '1962',
    'Date of Death': '12/31/2016',
    RegisteredYear: '2016',
    causeOfDeath: 'Hawkeye',
    AgeOrDateOfBirth: '61',
    ResultCount: 3,
  },
  {
    CertificateID: 3,
    'Registered Number': '1010',
    InOut: 'I',
    'First Name': 'MONKEY',
    'Last Name': 'JOE',
    'Decedent Name': 'MONKEY JOE',
    birthYear: '1991',
    'Date of Death': '8/16/2005',
    RegisteredYear: '2005',
    causeOfDeath: null,
    AgeOrDateOfBirth: '4 yrs. 2 mos. 10 dys',
    ResultCount: 3,
  },
];


describe('DeathCertificates resolvers', () => {
  describe('search', () => {
    let registry;

    beforeEach(() => {
      registry = new Registry((null: any));
    });

    it('returns search results', async () => {
      registry.search.mockReturnValue(TEST_SEARCH_RESULTS);

      const search = await resolvers.DeathCertificates.search({}, { query: 'Logan' }, { registry });
      expect(search.page).toEqual(1);
      expect(search.pageSize).toEqual(20);
      expect(search.pageCount).toEqual(1);
      expect(search.results.length).toEqual(3);
    });

    it('handles slightly more complicated pagination', async () => {
      registry.search.mockReturnValue(TEST_SEARCH_RESULTS);

      const search = await resolvers.DeathCertificates.search({}, { query: 'Logan', pageSize: 2, page: 1 }, { registry });
      expect(search.page).toEqual(1);
      expect(search.pageSize).toEqual(2);
      expect(search.pageCount).toEqual(2);
    });
  });

  describe('certificate', () => {
    it('returns a specific certificate', () => {
      expect(resolvers.DeathCertificates.certificate({}, { id: '000002' })).toBeDefined();
    });

    it('returns null if the certificate is not found', () => {
      expect(resolvers.DeathCertificates.certificate({}, { id: '999992' })).not.toBeDefined();
    });
  });

  describe('certificates', () => {
    it('returns certificates in order', () => {
      const certificates = resolvers.DeathCertificates.certificates({}, { ids: ['000002', '999992', '000001'] });
      expect(certificates[0]).toBeDefined();
      expect(certificates[1]).not.toBeDefined();
      expect(certificates[2]).toBeDefined();
    });
  });
});
