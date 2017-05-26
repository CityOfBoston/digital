// @flow

import DataLoader from 'dataloader';
import type { LoopbackGraphql } from '../loopback-graphql';
import type { DeathCertificate } from '../types';

import fetchDeathCertificates from '../queries/fetch-death-certificates';
import searchDeathCertificates from '../queries/search-death-certificates';
import type { DeathCertificateSearchResults } from '../types';

export type DeathCertificateCache = {[id: string]: DeathCertificate};

export default class DeathCertificatesDao {
  loopbackGraphql: LoopbackGraphql;
  loader: DataLoader<string, ?DeathCertificate>;

  constructor(loopbackGraphql: LoopbackGraphql) {
    this.loopbackGraphql = loopbackGraphql;

    // create new array shenanigans to get Flow to accept that we're not returning Errors
    this.loader = new DataLoader((ids) => fetchDeathCertificates(loopbackGraphql, ids).then((a) => a.map((i) => i)));
  }

  get(id: string): Promise<?DeathCertificate> {
    return this.loader.load(id);
  }

  async search(query: string, page: number): Promise<DeathCertificateSearchResults> {
    const results = await searchDeathCertificates(this.loopbackGraphql, query, page);

    results.results.forEach((cert) => {
      this.loader.prime(cert.id, cert);
    });

    return results;
  }
}
