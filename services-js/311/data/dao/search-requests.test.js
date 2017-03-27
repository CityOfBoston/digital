// @flow

import SearchRequestsGraphql from './graphql/SearchRequests.graphql';

import searchRequests from './search-requests';

test('searchRequests', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});
  await searchRequests(loopbackGraphql);
  expect(loopbackGraphql).toHaveBeenCalledWith(SearchRequestsGraphql, { query: null });
});

test('searchRequests with query', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});
  await searchRequests(loopbackGraphql, 'Catsgard');
  expect(loopbackGraphql).toHaveBeenCalledWith(SearchRequestsGraphql, { query: 'Catsgard' });
});
