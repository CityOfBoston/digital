// @flow

import DeathCertificatesDao from './DeathCertificatesDao';

import type { LoopbackGraphql } from '../loopback-graphql';
import type { DeathCertificate } from '../types';

jest.mock('../queries/fetch-death-certificates');
const fetchDeathCertificates: JestMockFn = (require('../queries/fetch-death-certificates'): any).default;

jest.mock('../queries/search-death-certificates');
const searchDeathCertificates: JestMockFn = (require('../queries/search-death-certificates'): any).default;

const TEST_DEATH_CERTIFICATE: DeathCertificate = {
  id: '000002',
  firstName: 'Bruce',
  lastName: 'Banner',
  birthYear: '1962',
  deathYear: '2016',
  causeOfDeath: 'Hawkeye',
  age: '043',
};

let loopbackGraphql: LoopbackGraphql;
let dao: DeathCertificatesDao;

beforeEach(() => {
  loopbackGraphql = jest.fn();
  dao = new DeathCertificatesDao(loopbackGraphql);
});

describe('get', () => {
  it('fetches the certificate with the given id', async () => {
    fetchDeathCertificates.mockReturnValue(Promise.resolve([TEST_DEATH_CERTIFICATE]));

    expect(await dao.get('000002')).toEqual(TEST_DEATH_CERTIFICATE);
  });

  it('caches the response for the next get', async () => {
    fetchDeathCertificates.mockReturnValueOnce(Promise.resolve([TEST_DEATH_CERTIFICATE]));

    expect(await dao.get('000002')).toEqual(TEST_DEATH_CERTIFICATE);
    expect(await dao.get('000002')).toEqual(TEST_DEATH_CERTIFICATE);
  });
});

describe('search', () => {
  it('searches for the query string', async () => {
    searchDeathCertificates.mockReturnValue(Promise.resolve([TEST_DEATH_CERTIFICATE]));

    expect(await dao.search('Banner')).toEqual([TEST_DEATH_CERTIFICATE]);
  });

  it('primes the id cache', async () => {
    searchDeathCertificates.mockReturnValue(Promise.resolve([TEST_DEATH_CERTIFICATE]));
    await dao.search('Banner');

    expect(await dao.get(TEST_DEATH_CERTIFICATE.id)).toEqual(TEST_DEATH_CERTIFICATE);
  });
});
