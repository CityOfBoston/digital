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

  await searchDeathCertificates(loopbackGraphql, 'Monkey Joe', 1, '1988', null);

  const queryVariables: SearchDeathCertificatesQueryVariables = {
    query: 'Monkey Joe',
    page: 1,
    startYear: '1988',
    endYear: null,
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(
    SearchDeathCertificatesGraphql,
    queryVariables,
  );
});
