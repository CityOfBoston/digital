// @flow

import type { FetchDeathCertificatesQueryVariables } from './graphql-types';
import FetchDeathCertificatesGraphql from './FetchDeathCertificates.graphql';

import fetchDeathCertificates from './fetch-death-certificates';

test('fetchDeathCertificates', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({
    deathCertificates: {
      certificates: [],
    },
  });

  await fetchDeathCertificates(loopbackGraphql, ['000001']);

  const queryVariables: FetchDeathCertificatesQueryVariables = {
    ids: ['000001'],
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(
    FetchDeathCertificatesGraphql,
    queryVariables,
  );
});
