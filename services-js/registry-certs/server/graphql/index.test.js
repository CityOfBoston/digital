// @flow

import schema from './index';

describe('schema', () => {
  it('is generated', () => {
    expect(schema).toMatchSnapshot();
  });
});
