import MockDate from 'mockdate';

import { resolvers, parseAgeOrDateOfBirth } from './death-certificates';
import RegistryDb from '../services/RegistryDb';
import RegistryDbFake from '../services/RegistryDbFake';

import fixtureData from '../../fixtures/registry-data/smith.json';

const DEATH_DATE = '10/20/2016';

beforeEach(() => {
  MockDate.set('09/12/2018');
});

afterEach(() => {
  MockDate.reset();
});

describe('DeathCertificates resolvers', () => {
  let registryDb: RegistryDb;

  beforeEach(() => {
    registryDb = new RegistryDbFake(fixtureData as any) as any;
  });

  describe('search', () => {
    it('returns search results', async () => {
      const search = await resolvers.DeathCertificates.search(
        {},
        { query: 'Logan' },
        {
          registryDb,
          stripe: {} as any,
          rollbar: {} as any,
          emails: {} as any,
          source: 'web',
        }
      );
      expect(search.page).toEqual(1);
      expect(search.pageSize).toEqual(20);
      expect(search.pageCount).toEqual(209);
      expect(search.results.length).toEqual(20);
    });

    it('handles slightly more complicated pagination', async () => {
      const search = await resolvers.DeathCertificates.search(
        {},
        { query: 'Logan', pageSize: 2, page: 1 },
        {
          registryDb,
          stripe: {} as any,
          rollbar: {} as any,
          emails: {} as any,
          source: 'web',
        }
      );
      expect(search.page).toEqual(1);
      expect(search.pageSize).toEqual(2);
      expect(search.pageCount).toEqual(2089);
    });
  });

  describe('certificate', () => {
    it('returns a specific certificate', async () => {
      expect(
        await resolvers.DeathCertificates.certificate(
          {},
          { id: fixtureData[0].CertificateID.toString() },
          {
            registryDb,
            stripe: {} as any,
            rollbar: {} as any,
            emails: {} as any,
            source: 'web',
          }
        )
      ).toBeTruthy();
    });

    it('returns null if the certificate is not found', async () => {
      expect(
        await resolvers.DeathCertificates.certificate(
          {},
          { id: '999992' },
          {
            registryDb,
            stripe: {} as any,
            rollbar: {} as any,
            emails: {} as any,
            source: 'web',
          }
        )
      ).not.toBeTruthy();
    });
  });

  describe('certificates', () => {
    it('returns certificates in order', async () => {
      const certificates = await resolvers.DeathCertificates.certificates(
        {},
        {
          ids: [
            fixtureData[4].CertificateID.toString(),
            '999992',
            fixtureData[2].CertificateID.toString(),
          ],
        },
        {
          registryDb,
          stripe: {} as any,
          rollbar: {} as any,
          emails: {} as any,
          source: 'web',
        }
      );
      expect(certificates[0]).toBeTruthy();
      expect(certificates[1]).not.toBeTruthy();
      expect(certificates[2]).toBeTruthy();
    });
  });
});

describe('parseAgeOrDateOfBirth', () => {
  test('null', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, null)).toEqual({
      age: null,
      birthDate: null,
    });
  });

  test('empty', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, '')).toEqual({
      age: null,
      birthDate: null,
    });
  });

  test('just age', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, '45')).toEqual({
      age: '45',
      birthDate: null,
    });
  });

  test('age with leading 0', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, '045')).toEqual({
      age: '45',
      birthDate: null,
    });
  });

  test('freeform age', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, '2 mos. 11 dys')).toEqual({
      age: '2 mos. 11 dys',
      birthDate: null,
    });
  });

  test('just date', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, '11/20/1970')).toEqual({
      age: '45',
      birthDate: '11/20/1970',
    });
  });

  test('just date with single digits', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, '1/2/1970')).toEqual({
      age: '46',
      birthDate: '1/2/1970',
    });
  });

  test('combined age and date', () => {
    expect(parseAgeOrDateOfBirth(DEATH_DATE, '46 YRS. (11/20/1970 )')).toEqual({
      age: '46 YRS.',
      birthDate: '11/20/1970',
    });
  });
});
