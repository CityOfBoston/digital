// @flow

import SearchCasesGraphql from './graphql/SearchCases.graphql';

import searchCases from './search-cases';

test('searchCases', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});
  await searchCases(loopbackGraphql);
  expect(loopbackGraphql).toHaveBeenCalledWith(SearchCasesGraphql, { query: null });
});

test('searchCases with query', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});
  await searchCases(loopbackGraphql, 'Catsgard');
  expect(loopbackGraphql).toHaveBeenCalledWith(SearchCasesGraphql, { query: 'Catsgard' });
});
