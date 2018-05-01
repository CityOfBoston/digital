import fs from 'fs';
import path from 'path';

import { makeExecutableSchema } from 'graphql-tools';

// This file is built by the "generate-schema" script.
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
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
