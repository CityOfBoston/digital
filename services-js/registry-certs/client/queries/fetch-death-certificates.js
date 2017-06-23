// @flow

import type { DeathCertificate } from '../types';
import type { LoopbackGraphql } from '../loopback-graphql';

import type {
  FetchDeathCertificatesQuery,
  FetchDeathCertificatesQueryVariables,
} from './graphql-types';
import FetchDeathCertificatesGraphql from './FetchDeathCertificates.graphql';

// Look up a death certificate by id
export default async function fetchDeathCertificates(
  loopbackGraphql: LoopbackGraphql,
  ids: string[],
): Promise<Array<?DeathCertificate>> {
  const queryVariables: FetchDeathCertificatesQueryVariables = { ids };
  const response: FetchDeathCertificatesQuery = await loopbackGraphql(
    FetchDeathCertificatesGraphql,
    queryVariables,
  );
  // Returning "any" until https://github.com/apollographql/apollo-codegen/issues/122 is fixed
  return (response.deathCertificates.certificates: any);
}
