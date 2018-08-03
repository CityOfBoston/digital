import { LookupDeathCertificateOrderQueryVariables } from './graphql-types';

import lookupDeathCertificateOrder from './lookup-death-certificate-order';

test('lookupDeathCertificateOrder', async () => {
  const loopbackGraphql: any = jest.fn().mockReturnValue({
    deathCertificates: {
      order: {},
    },
  });

  await lookupDeathCertificateOrder(
    loopbackGraphql,
    'RG-DC201801-999888',
    'nancy@mew.org'
  );

  const queryVariables: LookupDeathCertificateOrderQueryVariables = {
    id: 'RG-DC201801-999888',
    contactEmail: 'nancy@mew.org',
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(
    expect.any(String),
    queryVariables
  );
});
