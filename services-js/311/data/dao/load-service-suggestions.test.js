// @flow

import type { LoadServiceSuggestionsQueryVariables } from './graphql/types';
import LoadServiceSuggestionsGraphql from './graphql/LoadServiceSuggestions.graphql';

import loadServiceSuggestions from './load-service-suggestions';

test('loadServiceSuggestions', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});

  await loadServiceSuggestions(loopbackGraphql, 'thanos');

  const queryVariables: LoadServiceSuggestionsQueryVariables = {
    text: 'thanos',
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(
    LoadServiceSuggestionsGraphql,
    queryVariables
  );
});
