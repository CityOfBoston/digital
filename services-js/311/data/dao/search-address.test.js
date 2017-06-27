// @flow

import SearchAddressGraphql from './graphql/SearchAddress.graphql';

import searchAddress from './search-address';

test('searchAddress', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({ geocoder: {} });
  await searchAddress(loopbackGraphql, '114 Tremont');
  expect(loopbackGraphql).toHaveBeenCalledWith(SearchAddressGraphql, {
    query: '114 Tremont',
  });
});
