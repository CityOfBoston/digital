/**
 * @file Use this file to define a GraphQL schema with TypeScript types.
 *
 * Run `npm run generate-schema` to use `ts2gql` to turn this file into the
 * `schema.graphql` file that can be consumed by other tools.
 */

export interface QueryRoot {
  test: string;
}

/** @graphql schema */
export interface Schema {
  query: QueryRoot;
}
