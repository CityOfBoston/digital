import { handleBytes } from './FileInput';

describe('convert bytes to megabytes', () => {
  it('should convert 1024 bytes to 1KB', () => {
    const result = handleBytes.format(1024);

    expect(result.amount).toEqual(1);
    expect(result.unit).toBe('KB');
  });

  it('should convert 2000 bytes to 1.953125KB', () => {
    const result = handleBytes.format(2000);

    expect(result.amount).toEqual(1.953125);
    expect(result.unit).toBe('KB');
  });

  it('should convert 4641447 bytes into MB', () => {
    const result = handleBytes.format(4641447);

    expect(result.unit).toBe('MB');
  });
});

describe('convert file size to bytes', () => {
  it('should convert 1.953125KB to 2000 bytes', () => {
    expect(handleBytes.convert({ amount: 1.953125, unit: 'KB' })).toEqual(2000);
  });
});
