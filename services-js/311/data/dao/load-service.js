// @flow

import type { Service } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type { LoadServiceQuery, LoadServiceQueryVariables } from './graphql/types';
import LoadServiceGraphql from './graphql/LoadService.graphql';

export default async function loadService(loopbackGraphql: LoopbackGraphql, code: string): Promise<?Service> {
  const queryVariables: LoadServiceQueryVariables = { code };
  const response: LoadServiceQuery = await loopbackGraphql(LoadServiceGraphql, queryVariables);
  return response.service;
}
