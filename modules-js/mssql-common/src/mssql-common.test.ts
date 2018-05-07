import { createConnectionPool } from './mssql-common';

it('is a function that exists', () => {
  expect(createConnectionPool).toEqual(expect.any(Function));
});
