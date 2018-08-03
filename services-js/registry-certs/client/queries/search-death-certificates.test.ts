import { SearchDeathCertificatesQueryVariables } from './graphql-types';

import searchDeathCertificates from './search-death-certificates';

test('searchDeathCertificates', async () => {
  const loopbackGraphql: any = jest.fn().mockReturnValue({
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
    expect.any(String),
    queryVariables
  );
});
