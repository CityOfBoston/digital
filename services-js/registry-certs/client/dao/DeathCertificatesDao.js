// @flow

import DataLoader from 'dataloader';
import type { LoopbackGraphql } from '../loopback-graphql';
import type { DeathCertificate } from '../types';

import fetchDeathCertificates from '../queries/fetch-death-certificates';

export type DeathCertificateCache = {[id: string]: DeathCertificate};

export default class DeathCertificatesDao {
  loader: DataLoader<string, ?DeathCertificate>;

  constructor(loopbackGraphql: LoopbackGraphql) {
    // create new array shenanigans to get Flow to accept that we're not returning Errors
    this.loader = new DataLoader((ids) => fetchDeathCertificates(loopbackGraphql, ids).then((a) => a.map((i) => i)));
  }

  get(id: string): Promise<?DeathCertificate> {
    return this.loader.load(id);
  }
}
