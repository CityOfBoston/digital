import { capitalize } from './helpers';

describe('capitalize', () => {
  it('capitalizes the first character of a word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('capitalizes the first character of a sentence', () => {
    expect(capitalize('hello there')).toBe('Hello there');
  });
});
