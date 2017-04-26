// @flow

import LoadTopServiceSummariesGraphql from './graphql/LoadTopServiceSummaries.graphql';

import loadTopServiceSummaries from './load-top-service-summaries';

test('loadTopServiceSummaries', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});
  await loadTopServiceSummaries(loopbackGraphql, 10);
  expect(loopbackGraphql).toHaveBeenCalledWith(LoadTopServiceSummariesGraphql, { first: 10 }, { cacheKey: 'loadTopServiceSummaries:10' });
});
