import { ObjectOmit, ObjectOverwrite } from 'typelevel-ts';

// An object with keys from its type parameter, but any values for those keys.
export type SameKeys<T> = { [Field in keyof T]: any };
/**
 * Utility type to convert a GraphQL type interface from a schema.d.ts file into
 * a type for its resolver map.
 *
 * Handles resolver functions returning both values and Promises of values. If a
 * field is defined on the Input then it’s optional in the resolver map.
 *
 * If a resolver needs to return a value that doesn’t match the schema (say, an
 * input value to another set of resolvers), use the Overrides type.
 *
 * @template Schema The Schema type used in generating the GraphQL.
 * @template Input Object from the previous resolver that GraphQL is chaining
 * into these resolvers.
 * @template Context Type of the GraphQL context passed into the functions.
 * @template Overrides Object type of key => alternate type.
 *
 * @example
 * interface Schema {
 *   id: string;
 *   field: string;
 * }
 * interface SchemaInput {
 *   id: string;
 * }
 * const resolvers = {
 *   field: (obj: SchemaInput) => 'value',
 * };
 * resolvers as Resolvers<Schema, SchemaInput>;
 */
export type Resolvers<
  Schema,
  Input = undefined,
  Context = {},
  Overrides extends Partial<SameKeys<Schema>> = {}
> = ObjectOverwrite<
  ObjectOverwrite<
    // Fields that are defined in Input are optional. (Note the "?" below.) The
    // (keyof Input) & keyof (Schema) gives us a list of keys that are in the Schema
    // that are also in the Input type.
    {
      [Field in (keyof Input) & (keyof Schema)]?: ResolverFunction<
        Schema[Field],
        Input,
        Context
      >
    },
    // Fields that are not defined in Input are required.
    {
      [Field in keyof ObjectOmit<Schema, keyof Input>]: ResolverFunction<
        Schema[Field],
        Input,
        Context
      >
    }
  >,
  {
    [Field in (keyof Overrides) & (keyof Schema)]: ResolverFunction<
      Overrides[Field],
      Input,
      Context
    >
  }
>;

/**
 * Type of explicitly-declared resolvers. Handles the case where value is a
 * function, which is how ts2gql handles specifying query arguments.
 *
 * Sadly we can't make a type for Args based on the function parameters.
 */
export type ResolverFunction<T, Input, Context> = T extends (
  args: infer Args
) => infer TT
  ? (obj: Input, args: Args, context: Context, info: any) => TT | Promise<TT>
  : (obj: Input, args: {}, context: Context, info: any) => T | Promise<T>;

/**
 * This type generates an object that matches the schema object if there are no
 * custom resolver functions defined. Values can match the schema exactly, be
 * Promises, or be functions that GraphQL will call (that can themselves return
 * Promises).
 *
 * @template Schema The Schema type used in generating the GraphQL.
 * @template LiteralResolvers The "typeof" the literal resolver map. Don’t pass
 * in the type from Resolvers here, since declares optional keys you might not
 * actually have resolver functions for.
 * @template Context Type of the GraphQL context passed into the functions.
 *
 * @example
 * interface Schema {
 *   id: string;
 *   field: string;
 * }
 * interface SchemaInput extends ResolverInput<Schema, typeof resolvers> {}
 * const resolvers = {
 *   field: (obj: SchemaInput) => 'value',
 * };
 * const input: SchemaInput = {
 *   id: 'random',
 * };
 */
export type ResolverInput<Schema, LiteralResolvers = {}, Context = {}> = {
  [Field in keyof ObjectOmit<Schema, keyof LiteralResolvers>]:
    | Schema[Field]
    | Promise<Schema[Field]>
    | ImplicitResolverFunction<Schema[Field], Context>
};

/**
 * This type is used for values that feed into the implicit resolver function.
 * If a resolver function is not defined for a key, GraphQL will take the key’s
 * value from the obj and either return it or, if it's a function, call it with
 * the following signature.
 */
export type ImplicitResolverFunction<T, Context> = T extends (
  args: infer Args
) => infer TT
  ? (args: Args, context: Context, info: any) => TT | Promise<TT>
  : (args: {}, context: Context, info: any) => T | Promise<T>;

/**
 * Pulls the object type of the first "args" value of a Schema function.
 *
 * @example
 * export interface QueryRoot {
 *  commission(args: { id: string }): Commission;
 * }
 * const queryRootResolvers = {
 *   commission: (input, { id }: FieldArgs<QueryRoot['commission']>) => ({}),
 * };
 */
export type FieldArgs<F extends Function> = F extends (args: infer Args) => any
  ? Args
  : never;
