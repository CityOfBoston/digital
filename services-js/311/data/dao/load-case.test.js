// @flow

import type { LoadCaseQueryVariables } from './graphql/types';
import LoadCaseGraphql from './graphql/LoadCase.graphql';

import loadCase from './load-case';

test('loadCase', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({});

  await loadCase(loopbackGraphql, '17-0000001');

  const queryVariables: LoadCaseQueryVariables = {
    id: '17-0000001',
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(LoadCaseGraphql, queryVariables);
});
