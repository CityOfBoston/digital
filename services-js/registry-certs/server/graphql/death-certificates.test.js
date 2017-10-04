// @flow

import { resolvers, parseAgeOrDateOfBirth } from './death-certificates';
import { FixtureRegistry } from '../services/Registry';
import type Registry from '../services/Registry';

import fixtureData from '../../fixtures/registry/smith.json';

describe('DeathCertificates resolvers', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = (new FixtureRegistry(fixtureData): any);
  });

  describe('search', () => {
    it('returns search results', async () => {
      const search = await resolvers.DeathCertificates.search(
        {},
        { query: 'Logan' },
        { registry }
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
        { registry }
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
          { registry }
        )
      ).toBeTruthy();
    });

    it('returns null if the certificate is not found', async () => {
      expect(
        await resolvers.DeathCertificates.certificate(
          {},
          { id: '999992' },
          { registry }
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
        { registry }
      );
      expect(certificates[0]).toBeTruthy();
      expect(certificates[1]).not.toBeTruthy();
      expect(certificates[2]).toBeTruthy();
    });
  });
});

describe('parseAgeOrDateOfBirth', () => {
  test('null', () => {
    expect(parseAgeOrDateOfBirth(null)).toEqual({ age: null, birthDate: null });
  });

  test('empty', () => {
    expect(parseAgeOrDateOfBirth('')).toEqual({ age: null, birthDate: null });
  });

  test('just age', () => {
    expect(parseAgeOrDateOfBirth('45')).toEqual({ age: '45', birthDate: null });
  });

  test('age with leading 0', () => {
    expect(parseAgeOrDateOfBirth('045')).toEqual({
      age: '45',
      birthDate: null,
    });
  });

  test('freeform age', () => {
    expect(parseAgeOrDateOfBirth('2 mos. 11 dys')).toEqual({
      age: '2 mos. 11 dys',
      birthDate: null,
    });
  });

  test('just date', () => {
    expect(parseAgeOrDateOfBirth('11/20/1970')).toEqual({
      age: null,
      birthDate: '11/20/1970',
    });
  });

  test('just date with single digits', () => {
    expect(parseAgeOrDateOfBirth('1/2/1970')).toEqual({
      age: null,
      birthDate: '1/2/1970',
    });
  });

  test('combined age and date', () => {
    expect(parseAgeOrDateOfBirth('46 YRS. (11/20/1970 )')).toEqual({
      age: '46 YRS.',
      birthDate: '11/20/1970',
    });
  });
});
