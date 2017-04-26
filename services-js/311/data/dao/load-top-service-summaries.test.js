// @flow

import LoadTopServiceSummariesGraphql from './graphql/LoadTopServiceSummaries.graphql';

import loadTopServiceSummaries from './load-top-service-summaries';

test('loadTopServiceSummaries', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});
  await loadTopServiceSummaries(loopbackGraphql);
  expect(loopbackGraphql).toHaveBeenCalledWith(LoadTopServiceSummariesGraphql, null, { cacheKey: 'loadTopServiceSummaries' });
});
