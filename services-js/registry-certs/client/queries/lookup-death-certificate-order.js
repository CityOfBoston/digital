// @flow

import type { DeathCertificateOrder } from '../types';
import type { LoopbackGraphql } from '../lib/loopback-graphql';

import type {
  LookupDeathCertificateOrderQuery,
  LookupDeathCertificateOrderQueryVariables,
} from './graphql-types';
import LookupDeathCertificateOrderGraphql from './LookupDeathCertificateOrder.graphql';

// Look up a death certificate order by id and email address
export default async function lookupDeathCertificateOrder(
  loopbackGraphql: LoopbackGraphql,
  id: string,
  contactEmail: string
): Promise<?DeathCertificateOrder> {
  const queryVariables: LookupDeathCertificateOrderQueryVariables = {
    id,
    contactEmail,
  };
  const response: LookupDeathCertificateOrderQuery = await loopbackGraphql(
    LookupDeathCertificateOrderGraphql,
    queryVariables
  );

  return response.deathCertificates.order;
}
