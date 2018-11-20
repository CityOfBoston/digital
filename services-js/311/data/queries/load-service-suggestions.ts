import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import {
  LoadServiceSuggestionsVariables,
  LoadServiceSuggestions,
} from './types';

const QUERY = gql`
  query LoadServiceSuggestions($text: String!) {
    servicesForDescription(text: $text, max: 6, threshold: 0.0) {
      name
      code
      description
      group
    }
  }
`;

export default async function loadServiceSuggestions(
  fetchGraphql: FetchGraphql,
  text: string
) {
  const queryVariables: LoadServiceSuggestionsVariables = {
    text,
  };

  const response: LoadServiceSuggestions = await fetchGraphql(
    QUERY,
    queryVariables
  );

  return response.servicesForDescription;
}
