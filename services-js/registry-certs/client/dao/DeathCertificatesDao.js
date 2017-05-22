// @flow

import type { LoopbackGraphql } from '../loopback-graphql';
import type { DeathCertificate } from '../types';

import fetchDeathCertificates from '../queries/fetch-death-certificates';

export type DeathCertificateCache = {[id: string]: DeathCertificate};

export default class DeathCertificatesDao {
  loopbackGraphql: LoopbackGraphql;
  cache: DeathCertificateCache = {};

  constructor(loopbackGraphql: LoopbackGraphql) {
    this.loopbackGraphql = loopbackGraphql;
  }

  async get(id: string): Promise<?DeathCertificate> {
    const existingCertificate = this.cache[id];
    if (existingCertificate) {
      return existingCertificate;
    }

    const certificate = (await fetchDeathCertificates(this.loopbackGraphql, [id]))[0];

    if (certificate) {
      this.cache[id] = certificate;
    }

    return certificate;
  }
}
