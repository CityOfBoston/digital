import { fetchGraphql, gql, getParam } from './next-client-common';

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

describe('getParam', () => {
  it('returns the string', () => {
    expect(getParam('foo')).toEqual('foo');
  });

  it('returns the first element', () => {
    expect(getParam(['foo', 'bar'])).toEqual('foo');
  });

  it('returns undefined for empty array', () => {
    expect(getParam([])).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(getParam(undefined)).toBeUndefined();
  });

  it('returns the default for undefined', () => {
    expect(getParam(undefined, 'foo')).toEqual('foo');
  });

  it('returns the default for the empty array', () => {
    expect(getParam([], 'foo')).toEqual('foo');
  });
});
