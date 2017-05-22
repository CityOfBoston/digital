// @flow

import type { SearchDeathCertificatesQueryVariables } from './graphql-types';
import SearchDeathCertificatesGraphql from './SearchDeathCertificates.graphql';

import searchDeathCertificates from './search-death-certificates';

test('searchDeathCertificates', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({
    deathCertificates: {
      search: [],
    },
  });

  await searchDeathCertificates(loopbackGraphql, 'Monkey Joe');

  const queryVariables: SearchDeathCertificatesQueryVariables = {
    query: 'Monkey Joe',
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(SearchDeathCertificatesGraphql, queryVariables);
});
