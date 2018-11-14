// @flow

import type { Request } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type { LoadCaseQuery, LoadCaseQueryVariables } from './graphql/types';
import LoadCaseGraphql from './graphql/LoadCase.graphql';

// Load a single service request from its id (e.g. "17-00001615"). Returns
// null if the request is not found.
export default async function loadCase(
  loopbackGraphql: LoopbackGraphql,
  id: string
): Promise<?Request> {
  const queryVariables: LoadCaseQueryVariables = { id };
  const response: LoadCaseQuery = await loopbackGraphql(
    LoadCaseGraphql,
    queryVariables
  );
  return response.case;
}
