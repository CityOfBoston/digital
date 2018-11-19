/* eslint no-console: 0 */

import fs from 'fs-extra';
import path from 'path';
import { graphql } from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

import Schema from '../server/graphql';

const graphqlPath = path.join(__dirname, '../graphql');
const schemaJsonPath = path.join(graphqlPath, 'schema.json');
const schemaPath = path.join(graphqlPath, 'schema.graphql');

fs.mkdirsSync(graphqlPath);

// Save JSON of full schema introspection for Babel Relay Plugin to use
(async () => {
  const result = await graphql(Schema, introspectionQuery);
  if (result.errors) {
    console.error(
      'ERROR introspecting schema: ',
      JSON.stringify(result.errors, null, 2)
    );
  } else {
    fs.writeFileSync(schemaJsonPath, JSON.stringify(result, null, 2));
  }
})();

// Save user readable type system shorthand of schema
fs.writeFileSync(schemaPath, printSchema(Schema));
