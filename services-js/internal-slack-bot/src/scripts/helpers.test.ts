import { formatDateTime } from './helpers';

describe('formatDateTime', () => {
  // 2018-11-02 1:18:57 PM
  const timestamp = '1541180425';

  it('returns a formatted string', () => {
    const result = formatDateTime(timestamp);

    expect(result).toBe('11/2/2018, 1:40:25 PM EDT');
  });
});
