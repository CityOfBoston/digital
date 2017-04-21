// @flow

import LoadServiceSummariesGraphql from './graphql/LoadServiceSummaries.graphql';

import loadServiceSummaries from './load-service-summaries';

test('loadServiceSummaries', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});
  await loadServiceSummaries(loopbackGraphql);
  expect(loopbackGraphql).toHaveBeenCalledWith(LoadServiceSummariesGraphql);
});
