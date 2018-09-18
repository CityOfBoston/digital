import { formatBytes } from './FileInput';

describe('convert bytes to megabytes', () => {
  it('should convert 1024 bytes to 1KB', () => {
    const result = formatBytes(1024);

    expect(+result.quantity).toEqual(1);
    expect(result.unit).toBe('KB');
  });

  it('should convert 2000 bytes to 1.95KB', () => {
    const result = formatBytes(2000);

    expect(+result.quantity).toEqual(1.95);
    expect(result.unit).toBe('KB');
  });

  it('should convert 4641447 bytes into MB', () => {
    const result = formatBytes(4641447);

    expect(result.unit).toBe('MB');
  });
});
