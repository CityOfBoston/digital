import { LookupDeathCertificateOrderVariables } from './graphql-types';

import lookupDeathCertificateOrder from './lookup-death-certificate-order';

test('lookupDeathCertificateOrder', async () => {
  const fetchGraphql: any = jest.fn().mockReturnValue({
    deathCertificates: {
      order: {},
    },
  });

  await lookupDeathCertificateOrder(
    fetchGraphql,
    'RG-DC201801-999888',
    'nancy@mew.org'
  );

  const queryVariables: LookupDeathCertificateOrderVariables = {
    id: 'RG-DC201801-999888',
    contactEmail: 'nancy@mew.org',
  };

  expect(fetchGraphql).toHaveBeenCalledWith(expect.any(String), queryVariables);
});
