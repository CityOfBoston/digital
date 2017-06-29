// @flow

import type { SearchAddressPlace } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type {
  SearchAddressQuery,
  SearchAddressQueryVariables,
} from './graphql/types';
import SearchAddressGraphql from './graphql/SearchAddress.graphql';

// Takes a partial address string and searches for it
export default async function searchAddress(
  loopbackGraphql: LoopbackGraphql,
  query: string
): Promise<?SearchAddressPlace> {
  const args: SearchAddressQueryVariables = { query };

  const response: SearchAddressQuery = await loopbackGraphql(
    SearchAddressGraphql,
    args
  );
  return response.geocoder.search;
}
