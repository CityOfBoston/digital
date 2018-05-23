import { fetchGraphql, gql } from './next-client-common';

it('is defined', () => {
  expect(fetchGraphql).toBeDefined();
});

describe('gql', () => {
  it('passes things through', () => {
    const VALUE = '3';
    const str = gql`value: ${VALUE}!`;
    expect(str).toEqual('value: 3!');
  });
});
