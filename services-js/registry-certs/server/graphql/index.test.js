// @flow
// graphql-tools/schema
import schema from './index.ts';

describe('schema', () => {
  it('is generated', () => {
    expect(schema).toMatchSnapshot();
  });
});
