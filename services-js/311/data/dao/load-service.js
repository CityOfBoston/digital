// @flow

import type { Service } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type {
  LoadServiceQuery,
  LoadServiceQueryVariables,
} from './graphql/types';
import LoadServiceGraphql from './graphql/LoadService.graphql';

// Loads a single Service instance, with information about what questions are
// defined for requests to that service, whether contact/location info is
// required, &c.
export default async function loadService(
  loopbackGraphql: LoopbackGraphql,
  code: string,
): Promise<?Service> {
  const queryVariables: LoadServiceQueryVariables = { code };
  const response: LoadServiceQuery = await loopbackGraphql(
    LoadServiceGraphql,
    queryVariables,
    { cacheKey: `loadService:${code}` },
  );
  return response.service;
}
