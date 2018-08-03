import DeathCertificatesDao from './DeathCertificatesDao';

import { LoopbackGraphql } from '../lib/loopback-graphql';
import { DeathCertificateSearchResults } from '../types';

import { TYPICAL_CERTIFICATE } from '../../fixtures/client/death-certificates';

jest.mock('../queries/fetch-death-certificates');
const fetchDeathCertificates: jest.Mock = require('../queries/fetch-death-certificates')
  .default;

jest.mock('../queries/search-death-certificates');
const searchDeathCertificates: jest.Mock = require('../queries/search-death-certificates')
  .default;

const TEST_SEARCH_RESULTS: DeathCertificateSearchResults = {
  results: [TYPICAL_CERTIFICATE],
  page: 0,
  pageCount: 1,
  pageSize: 10,
  resultCount: 1,
};

let loopbackGraphql: LoopbackGraphql;
let dao: DeathCertificatesDao;

beforeEach(() => {
  loopbackGraphql = jest.fn();
  dao = new DeathCertificatesDao(loopbackGraphql);
});

describe('get', () => {
  it('fetches the certificate with the given id', async () => {
    fetchDeathCertificates.mockReturnValue(
      Promise.resolve([TYPICAL_CERTIFICATE])
    );

    expect(await dao.get('000002')).toEqual(TYPICAL_CERTIFICATE);
  });

  it('caches the response for the next get', async () => {
    fetchDeathCertificates.mockReturnValueOnce(
      Promise.resolve([TYPICAL_CERTIFICATE])
    );

    expect(await dao.get('000002')).toEqual(TYPICAL_CERTIFICATE);
    expect(await dao.get('000002')).toEqual(TYPICAL_CERTIFICATE);
  });
});

describe('search', () => {
  it('searches for the query string', async () => {
    searchDeathCertificates.mockReturnValue(
      Promise.resolve(TEST_SEARCH_RESULTS)
    );

    expect((await dao.search('Banner', 1)).results).toEqual([
      TYPICAL_CERTIFICATE,
    ]);
  });

  it('primes the id cache', async () => {
    searchDeathCertificates.mockReturnValue(
      Promise.resolve(TEST_SEARCH_RESULTS)
    );
    await dao.search('Banner', 1);

    expect(await dao.get(TYPICAL_CERTIFICATE.id)).toEqual(TYPICAL_CERTIFICATE);
  });

  it('caches results', async () => {
    searchDeathCertificates.mockReturnValue(
      Promise.resolve(TEST_SEARCH_RESULTS)
    );
    await dao.search('Banner', 1);

    searchDeathCertificates.mockClear();

    await dao.search('Banner', 1);
    expect(searchDeathCertificates).not.toHaveBeenCalled();
  });

  it('clears the cache on a new search', async () => {
    searchDeathCertificates.mockReturnValue(
      Promise.resolve(TEST_SEARCH_RESULTS)
    );
    await dao.search('Banner', 1);
    await dao.search('Logan', 1);

    searchDeathCertificates.mockClear();

    await dao.search('Banner', 1);
    expect(searchDeathCertificates).toHaveBeenCalled();
  });
});

describe('parseQuery', () => {
  it('passes through query with no years', () => {
    expect(dao.parseQuery('jane doe')).toEqual({
      query: 'jane doe',
      startYear: null,
      endYear: null,
    });
  });

  it('uses one year as start and end', () => {
    expect(dao.parseQuery('jane doe 1966')).toEqual({
      query: 'jane doe',
      startYear: '1966',
      endYear: '1966',
    });
  });

  it('finds 2 years with an en-dash', () => {
    expect(dao.parseQuery('1966–2011 jane doe ')).toEqual({
      query: 'jane doe',
      startYear: '1966',
      endYear: '2011',
    });
  });
});
