# graphql-common

Utilities for type-safe GraphQL resolvers.

This package leverages TypeScript-based schema definitions to make type
signatures for the necessary resolver functions.

## Getting Started

### Defining a GraphQL Schema

First, define a schema using TypeScript `interface` statements. These will be
used by the `ts2gql` tool to make a GraphQL schema definition. For example:

```typescript
/** @graphql schema */
export interface Schema {
  query: Query;
}

# This must be called "Query" for the GraphQL tools to find it
export interface Query {
  commissions: Commission[];
}

export interface Commission {
  id: number;
  name: string;
}
```

Then write a `generate-graphql-schema` script in your `package.json`.

After `ts2gql` makes a `schema.graphql` file, you can load it to serve as the
input to `makeExecutableSchema'.

```typescript
const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
  'utf-8'
);

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  resolvers: {
    Query: queryRootResolvers,
  },
  allowUndefinedInResolve: false,
});
```

### Writing resolvers

In the above example, we need to write resolvers for the `Query` type, since
it’s the root. To do this, use the `Resolvers` macro to generate the type that
`makeExecutableSchema` and the GraphQL library expect.

```typescript
declare class CommissionsDao {
  fetchCommissions: () => Promise<Commission[]>;
}

interface Context {
  dao: CommissionsDao;
}

const queryRootResolvers: Resolvers<Query, Context> = {
  commissions: (_obj, _args, { dao }) => dao.fetchCommissions(),
};
```

Because `fetchCommissions` returns (a `Promise` of) a `Commission` array, the
above resolver will typecheck. GraphQL has a default resolver that will use the
objects returned by the `commissions` resolver and match them with any fields
queried on the `Commission` GraphQL type.

### Custom input types

Sometimes, though, your data sources and GraphQL schema types don’t line up so
neatly. Say that `fetchCommissions` had a different signature:

```typescript
interface DbCommission {
  ID: number;
  Name: string | null;
}

declare class CommissionsDao {
  fetchCommissions: () => Promise<DbCommission[]>;
}
```

The above resolver wouldn’t typecheck because the resolver for the `commissions`
field needs to return values that match the `Commission` schema interface.

One solution would be to call a transformer function from the `commissions`
schema. Probably, though, as your schema builds out, you’ll want to write
resolver functions for the `Commission` type as well to put the transformers in
one place and allow you to chain off to yet more objects.

If `Commission` has its own resolvers, now the `commissions` resolver shouldn’t
return `Commission` objects directly. Instead, it needs to return values that
the `Commission` resolvers can operate on. Then it’s their job to fulfill the
`Commission` interface.

The way we handle this is the `ResolvableWith` marker. By adding
`ResolvableWith` to a schema interface, you signal to the `Resolvers` macro that
it needs to adjust the return type requirements for any resolvers that are
returning that schema interface. Additionally, it tells `Resolvers` the type
that resolver functions get as their first argument.

Here’s the full example, using `Resolvers` and `ResolvableWith` together:

```typescript
/** @graphql schema */
export interface Schema {
  query: Query;
}

export interface Query {
  commissions: Commission[];
}

export interface Commission extends ResolvableWith<DbCommission> {
  id: number;
  name: string;
}

const schemaGraphql = fs.readFileSync(
  path.resolve(__dirname, '..', '..', '..', 'graphql', 'schema.graphql'),
  'utf-8'
);

interface DbCommission {
  ID: number;
  Name: string | null;
}

declare class CommissionsDao {
  fetchCommissions: () => Promise<DbCommission[]>;
}

interface Context {
  dao: CommissionsDao;
}

const queryRootResolvers: Resolvers<QueryRoot, Context> = {
  // This is now expected to return an array of DbCommission objects
  // because Commission has been tagged with ResolvableWith<DbCommission>.
  commissions: (_obj, _args, { dao }) => dao.fetchCommissions(),
};

const commissionResolvers: Resolvers<Commission, Context> = {
  // The input object to these resolvers is automatically typed to
  // DbCommission thanks to the ResolvableWith tag.
  id: ({ ID }) => ID,
  name: ({ Name }) => Name || 'Unknown name',
};

export default makeExecutableSchema({
  typeDefs: [schemaGraphql],
  resolvers: {
    QueryRoot: queryRootResolvers,
    Commission: commissionResolvers,
  },
  allowUndefinedInResolve: false,
});
```

### More on the default resolver

The GraphQL default resolver actually has a bit of logic to it. Consider the
following schema:

```typescript
export interface Schema {
  query: QueryRoot;
}

export interface QueryRoot {
  commission: Commission;
}

export interface Commission {
  id: number;
  name: string;
}
```

The resolver for `commission` could return any of these:

```typescript
{
  id: 3,
  name: 'Environment',
}

{
  id: Promise.resolve(3),
  name: Promise.resolve('Environment'),  
}

{
  id: 3,
  name: (_args, { dao }) => dao.lookupName(3),
}
```

The default resolver handles values, `Promise`s, and functions, which it calls
with any args for the field and the context. Note that unlike resolver
functions, these functions are not passed an “input” object for their first
argument.

As we saw at the very start, if your resolvers are just returning objects that
match the schema interface, you don’t need to do anything extra. But, if you
want your resolvers to be able to return objects that include `Promise`s and
functions for the default resolver to call, you need to do something.

We can once again use `ResolvableWith` on the schema interface to inject a
different type that our resolvers’ return values will be typechecked against. In
this case, rather than replace a schema interface with, say, a database
interface, we can use the `DefaultResolvable` macro to convert a schema
interface into its “default-resolvable” form. Now, resolver return values will
typecheck against the `DefalutResolvable` version, which allows for `Promise`s
and functions.

```typescript
export interface Schema {
  query: QueryRoot;
}

export interface QueryRoot {
  commission: Commission;
}

export interface Commission extends ResolvableWith<DefaultResolvable<Commission, Context>> {
  id: number;
  name: string;
}

const queryRootResolvers: Resolvers<QueryRoot, Context> = {
  commission: () => ({
    id: Promise.resolve(3),
    name: (_args, { dao }) => dao.lookupName(3),
  }),
};
```

While you could tag every schema type with `DefaultResolvable` (providing it
doesn’t need a custom input type), that gets verbose, so only use it where you
really need to take advantage of the default resolver’s advanced features.
