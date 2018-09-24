import { gql } from '@cityofboston/next-client-common';
import { DeathCertificate } from '../types';
import { LoopbackGraphql } from '../lib/loopback-graphql';

import {
  FetchDeathCertificates,
  FetchDeathCertificatesVariables,
} from './graphql-types';

const QUERY = gql`
  query FetchDeathCertificates($ids: [String!]!) {
    deathCertificates {
      certificates(ids: $ids) {
        id
        firstName
        lastName
        deathYear
        deathDate
        pending
        age
        birthDate
      }
    }
  }
`;

// Look up a death certificate by id
export default async function fetchDeathCertificates(
  loopbackGraphql: LoopbackGraphql,
  ids: string[]
): Promise<Array<DeathCertificate | null>> {
  const queryVariables: FetchDeathCertificatesVariables = { ids };
  const response: FetchDeathCertificates = await loopbackGraphql(
    QUERY,
    queryVariables
  );

  return response.deathCertificates.certificates;
}
