import { makeServerContext } from '../../lib/test/make-context';

import SearchLayout from './SearchLayout';

describe('search form', () => {
  let data;

  beforeEach(async () => {
    const ctx = makeServerContext('/lookup', { q: 'Alpha Flight' });
    data = (await SearchLayout.getInitialProps(ctx, {})).data;
  });

  test('getInitialProps', () => {
    expect(data.view).toEqual('search');
    expect(data.query).toEqual('Alpha Flight');
  });
});
