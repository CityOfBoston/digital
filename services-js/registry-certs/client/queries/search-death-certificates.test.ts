import { SearchDeathCertificatesVariables } from './graphql-types';

import searchDeathCertificates from './search-death-certificates';

test('searchDeathCertificates', async () => {
  const fetchGraphql: any = jest.fn().mockReturnValue({
    deathCertificates: {
      search: [],
    },
  });

  await searchDeathCertificates(fetchGraphql, 'Monkey Joe', 1, '1988', null);

  const queryVariables: SearchDeathCertificatesVariables = {
    query: 'Monkey Joe',
    page: 1,
    startYear: '1988',
    endYear: null,
  };

  expect(fetchGraphql).toHaveBeenCalledWith(expect.any(String), queryVariables);
});
