// @flow

import type { LoadRequestQueryVariables } from './graphql/types';
import LoadRequestGraphql from './graphql/LoadRequest.graphql';

import loadRequest from './load-request';

test('loadRequest', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});

  await loadRequest(loopbackGraphql, '17-0000001');

  const queryVariables: LoadRequestQueryVariables = {
    id: '17-0000001',
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(
    LoadRequestGraphql,
    queryVariables
  );
});
