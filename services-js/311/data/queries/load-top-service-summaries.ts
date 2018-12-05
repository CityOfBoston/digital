import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import {
  LoadTopServiceSummaries,
  LoadTopServiceSummariesVariables,
} from './types';

const QUERY = gql`
  query LoadTopServiceSummaries($first: Int!) {
    topServices(first: $first) {
      code
      name
      description
      group
    }
  }
`;

/**
 * Loads a list of the most popular ServiceSummary objects available in the
 * Open311 endpoint.
 */
export default async function loadTopServiceSummaries(
  fetchGraphql: FetchGraphql,
  count: number
) {
  const variables: LoadTopServiceSummariesVariables = { first: count };
  const response: LoadTopServiceSummaries = await fetchGraphql(
    QUERY,
    variables,
    `LoadTopServiceSummaries-${count}`
  );
  return response.topServices;
}
