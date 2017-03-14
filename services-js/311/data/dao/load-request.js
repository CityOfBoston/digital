// @flow

import type { Request } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type { LoadRequestQuery, LoadRequestQueryVariables } from './graphql/types';
import LoadRequestGraphql from './graphql/LoadRequest.graphql';

export default async function loadRequest(loopbackGraphql: LoopbackGraphql, id: string): Promise<?Request> {
  const queryVariables: LoadRequestQueryVariables = { id };
  const response: LoadRequestQuery = await loopbackGraphql(LoadRequestGraphql, queryVariables);
  return response.request;
}
