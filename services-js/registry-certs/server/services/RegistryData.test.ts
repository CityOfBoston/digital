import { splitKeys } from './RegistryData';

describe('split keys', () => {
  it('combines keys', () => {
    expect(splitKeys(12, ['12345', '67890'])).toEqual(['12345,67890']);
  });

  it('divides keys up', () => {
    expect(splitKeys(12, ['12345', '67890', 'abcde'])).toEqual([
      '12345,67890',
      'abcde',
    ]);
  });

  it('handles no keys', () => {
    expect(splitKeys(12, [])).toEqual([]);
  });
});
