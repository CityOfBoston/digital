import DataLoader from 'dataloader';
import { LoopbackGraphql } from '../lib/loopback-graphql';
import { DeathCertificate } from '../types';

import fetchDeathCertificates from '../queries/fetch-death-certificates';
import searchDeathCertificates from '../queries/search-death-certificates';
import lookupDeathCertificateOrder from '../queries/lookup-death-certificate-order';
import { DeathCertificateSearchResults, DeathCertificateOrder } from '../types';

export type DeathCertificateCache = { [id: string]: DeathCertificate };

export default class DeathCertificatesDao {
  loopbackGraphql: LoopbackGraphql;
  loader: DataLoader<string, DeathCertificate | null>;

  cacheFullQuery: string | null = null;
  cacheByPage: { [page: number]: DeathCertificateSearchResults } = {};

  constructor(loopbackGraphql: LoopbackGraphql) {
    this.loopbackGraphql = loopbackGraphql;

    // create new array shenanigans to get Flow to accept that we're not returning Errors
    this.loader = new DataLoader(ids =>
      fetchDeathCertificates(loopbackGraphql, ids).then(a => [...a])
    );
  }

  get(id: string): Promise<DeathCertificate | null> {
    return this.loader.load(id);
  }

  async search(
    fullQuery: string,
    page: number
  ): Promise<DeathCertificateSearchResults> {
    if (fullQuery === this.cacheFullQuery) {
      const results = this.cacheByPage[page];
      if (results) {
        return results;
      }
    } else {
      this.cacheFullQuery = fullQuery;
      this.cacheByPage = {};
    }

    const { query, startYear, endYear } = this.parseQuery(fullQuery);

    const results = await searchDeathCertificates(
      this.loopbackGraphql,
      query,
      page,
      startYear,
      endYear
    );

    this.cacheByPage[page] = results;

    results.results.forEach(cert => {
      this.loader.prime(cert.id, cert);
    });

    return results;
  }

  async lookupOrder(
    id: string,
    contactEmail: string
  ): Promise<DeathCertificateOrder | null> {
    return lookupDeathCertificateOrder(this.loopbackGraphql, id, contactEmail);
  }

  parseQuery(
    fullQuery: string
  ): { query: string; startYear: string | null; endYear: string | null } {
    // match a 4-digit year, and optionally a second 4-digit year with a hypen or en-dash
    const yearRegexp = /(\d{4})\s*[-–]?\s*(\d{4})?/;

    let query;
    let startYear;
    let endYear;

    const match = fullQuery.match(yearRegexp);
    if (match) {
      query = fullQuery.replace(yearRegexp, '').trim();
      startYear = match[1];
      endYear = match[2] || match[1];
    } else {
      query = fullQuery;
      startYear = null;
      endYear = null;
    }

    return {
      query,
      startYear,
      endYear,
    };
  }
}
