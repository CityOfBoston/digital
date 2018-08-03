import { FetchDeathCertificatesQueryVariables } from './graphql-types';

import fetchDeathCertificates from './fetch-death-certificates';

test('fetchDeathCertificates', async () => {
  const loopbackGraphql: any = jest.fn().mockReturnValue({
    deathCertificates: {
      certificates: [],
    },
  });

  await fetchDeathCertificates(loopbackGraphql, ['000001']);

  const queryVariables: FetchDeathCertificatesQueryVariables = {
    ids: ['000001'],
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(
    expect.any(String),
    queryVariables
  );
});
