/**
 * @file Use this file to define a GraphQL schema with TypeScript types.
 *
 * Run `npm run generate-graphql-schema` to use `ts2gql` to turn this file into
 * the `schema.graphql` file that can be consumed by other tools.
 *
 * The output is generated in the “graphql” directory in the package root so
 * that it can be `readFileSync`’d from both `build` (during dev and production)
 * and `src` (during test).
 */

export interface QueryRoot {
  test: string;
}

/** @graphql schema */
export interface Schema {
  query: QueryRoot;
}
