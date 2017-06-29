// @flow

import gutil from 'gulp-util';
import through from 'through2';

import { graphql } from 'graphql';
import type { GraphQLSchema } from 'graphql';

import { introspectionQuery, printSchema } from 'graphql/utilities';

type Options = {
  schema: GraphQLSchema,
};

async function generateSchemaFiles(schema, push) {
  const result = await graphql(schema, introspectionQuery);

  if (result.errors) {
    throw new Error(result.errors[0]);
  } else {
    push(
      new gutil.File({
        path: 'schema.json',
        contents: new Buffer(JSON.stringify(result, null, 2)),
      })
    );
  }

  // Save user readable type system shorthand of schema
  push(
    new gutil.File({
      path: 'schema.graphql',
      contents: new Buffer(printSchema(schema)),
    })
  );
}

module.exports = ({ schema }: Options) => {
  const stream = through.obj();

  generateSchemaFiles(schema, f => {
    stream.push(f);
  }).then(
    () => {
      stream.emit('end');
    },
    err => {
      process.nextTick(() => stream.emit('error', err));
    }
  );

  return stream;
};
