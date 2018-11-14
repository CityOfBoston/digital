// @flow

import type { ServiceSummary } from '../types';
import type { LoopbackGraphql } from './loopback-graphql';

import type {
  LoadServiceSuggestionsQuery,
  LoadServiceSuggestionsQueryVariables,
} from './graphql/types';
import LoadServiceSuggestionsGraphql from './graphql/LoadServiceSuggestions.graphql';

export default async function loadServiceSuggestions(
  loopbackGraphql: LoopbackGraphql,
  text: string
): Promise<ServiceSummary[]> {
  const queryVariables: LoadServiceSuggestionsQueryVariables = {
    text,
  };
  const response: LoadServiceSuggestionsQuery = await loopbackGraphql(
    LoadServiceSuggestionsGraphql,
    queryVariables
  );
  return response.servicesForDescription;
}
