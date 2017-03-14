// @flow

import type { LoadServiceQueryVariables } from './graphql/types';
import LoadServiceGraphql from './graphql/LoadService.graphql';

import loadService from './load-service';

test('loadService', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});

  await loadService(loopbackGraphql, 'CSMCINC');

  const queryVariables: LoadServiceQueryVariables = {
    code: 'CSMCINC',
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(LoadServiceGraphql, queryVariables);
});
