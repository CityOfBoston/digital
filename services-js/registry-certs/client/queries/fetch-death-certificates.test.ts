import { FetchDeathCertificatesVariables } from './graphql-types';

import fetchDeathCertificates from './fetch-death-certificates';

test('fetchDeathCertificates', async () => {
  const fetchGraphql: any = jest.fn().mockReturnValue({
    deathCertificates: {
      certificates: [],
    },
  });

  await fetchDeathCertificates(fetchGraphql, ['000001']);

  const queryVariables: FetchDeathCertificatesVariables = {
    ids: ['000001'],
  };

  expect(fetchGraphql).toHaveBeenCalledWith(expect.any(String), queryVariables);
});
