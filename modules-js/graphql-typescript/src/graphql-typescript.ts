/**
 * Utility type to convert a GraphQL schema interface into a type for its
 * resolver map.
 *
 * Handles resolver functions returning both values and Promises of values. Also
 * handles schema fields defined as functions, which means they take GraphQL
 * arguments.
 *
 * @see ResolvableWith
 *
 * @template Schema The Schema type used in generating the GraphQL.
 * @template Context Type of the GraphQL context passed into the functions.
 *
 * @example
 * interface Schema {
 *   version: string;
 *   field: string;
 * }
 * interface Context {
 *   lookupField: () => Promise<string>;
 * }
 * const resolvers: Resolvers<Schema, Context> = {
 *   version: () => '3',
 *   field: (_obj, _args, { lookupField }) => lookupField(),
 * };
 */
export type Resolvers<
  Schema,
  Context = {},
  Input = ReplaceResolvableWith<Schema>
> = {
  [Field in keyof Schema]: ResolverFunction<
    ReplaceResolvableWith<ResolverField_InferOutput<Schema[Field]>>,
    Input,
    ResolverField_InferArgs<Schema[Field]>,
    Context
  >
};

/**
 * If the type of the field is a function, return the function’s return type.
 * Otherwise just return the type.
 *
 * This is because ts2gql uses functions in the schema interfaces to signal when
 * query arguments are allowed.
 */
export type ResolverField_InferOutput<FieldType> = FieldType extends (
  ...args: any[]
) => infer ReturnType
  ? ReturnType
  : FieldType;

/**
 * This is the companion to the "InferOutput" helper. If the field has been
 * defined as a function, then the args to that function (declared in ts2gql as
 * an object type as the first parameter) become the args to the resolver.
 */
export type ResolverField_InferArgs<Output> = Output extends (
  args: infer Args
) => any
  ? Args
  : {};

/**
 * Type for an explicit resolver function.
 */
export type ResolverFunction<Output, Obj, Args, Context> = (
  obj: Obj,
  args: Args,
  context: Context,
  info?: any
) => Output | Promise<Output>;

/**
 * Tag class to associate a resolver input type with a schema interface. This
 * signals that any resolver that is supposed to output this type should instead
 * output the input type instead, because that’s what this type’s resolvers expect.
 *
 * This class has no effect on its own, but is used with Resolvers.
 *
 * @see Resolvers
 *
 * @example
 * interface Parent {
 *   child: Child;
 * }
 * interface Child extends ResolvableWith<ChildInput> {
 *   name: string;
 * }
 * interface ChildInput {
 *   id: string;
 * }
 * const parentResolvers = {
 *   child: () => ({ id: '1' }),
 * }
 * const childResolvers = {
 *   name: ({ id }: ChildInput, _, { dao }) => dao.lookupName(id),
 * }
 */
export declare class ResolvableWith<Input> {
  // This has to be protected, not private, because TypeScript will not include
  // the type annotation for private fields when generating the declaration
  // file.
  //
  // Leaving it as protected means that it won’t show up in any keyof results,
  // so we won’t try to generate a resolver for it, and our ts2gql fork will
  // not emit it in the GraphQL schema.
  protected __resolverInput: Input;
}

/**
 * Given a type, substitutes it for its "Input" type if it has been tagged with
 * ResolvableWith.
 *
 * Also handles the case where the type is an array of the tagged type, in which
 * case this returns the array of the "Input" type.
 */
export type ReplaceResolvableWith<T> = T extends Array<infer OutputElement>
  ? Array<ReplaceResolvableWith1<OutputElement>>
  : ReplaceResolvableWith1<T>;

export type ReplaceResolvableWith1<T> = T extends ResolvableWith<infer Input>
  ? Input
  : T;

/**
 * This defines an object type or array of an object type that GraphQL’s default
 * resolver can turn into an instance of Schema. This is used in lieu of a
 * resolver map for the type.
 *
 * These fields are either the Schema values (or Promises), or a
 * DefaultResolvableFunction that returns the right type (or Promise).
 *
 * @see Resolvers
 * @see ResolvableWith
 * @see
 * https://www.apollographql.com/docs/graphql-tools/resolvers#Default-resolver
 *
 * @example
 * interface Parent {
 *   child: Child;
 * }
 * interface Child extends ResolvableWith<DefaultResolvable<Child>> {
 *   name: string;
 * }
 * const parentResolvers: Resolvers<Parent> = {
 *   child: () => ({ name: () => Promise.resolve('name') }),
 * }
 */
export type DefaultResolvable<Schema, Context = {}> = {
  [Field in keyof Schema]:
    | Schema[Field]
    | Promise<Schema[Field]>
    | DefaultResolvableFunction<
        ReplaceResolvableWith<ResolverField_InferOutput<Schema[Field]>>,
        ResolverField_InferArgs<Schema[Field]>,
        Context
      >
};

/**
 * Signature for functions the default resolver will call.
 *
 * Similar to ResolverFunction but doesn’t take an input object.
 */
export type DefaultResolvableFunction<Output, Args, Context> = (
  args: Args,
  context: Context,
  info?: any
) => Output | Promise<Output>;

/****** UTILITIES *********/

/** @graphql Int */
export type Int = number;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
