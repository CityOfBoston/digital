import fs from 'fs';
import path from 'path';

import { makeExecutableSchema } from 'graphql-tools';

// This file is build by the "generate-schema" script and output into the
// "build" directory.
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, 'schema.graphql'),
  'utf-8'
);

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  resolvers: {
    QueryRoot: {
      test: () => 'hello world',
    },
  },
  allowUndefinedInResolve: false,
});
