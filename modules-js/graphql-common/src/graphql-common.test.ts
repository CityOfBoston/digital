import { Resolvers, ResolverInput, FieldArgs } from './graphql-common';

/*
  The tests in here don’t assert anything. The real test is whether this file
  typechecks at all.

  That also means that we don’t have any tests for "X types don’t work."
*/

describe('Resolvers', () => {
  describe('explicit resolvers', () => {
    interface NameCountSchema {
      name: string;
      count: number;
    }

    it('handles functions that return their types', () => {
      const resolvers: Resolvers<NameCountSchema> = {
        name: () => 'name',
        count: () => 3,
      };
    });

    it('handles functions that return promises', () => {
      const resolvers: Resolvers<NameCountSchema> = {
        name: () => Promise.resolve('name'),
        count: () => Promise.resolve(3),
      };
    });
  });

  describe('schema with a function', () => {
    interface NameCountSchema {
      name(args: { id: string }): string;
    }

    it('handles functions with args', () => {
      const resolvers: Resolvers<NameCountSchema> = {
        name: (obj, { id }) => 'name' + id,
      };
    });
  });

  describe('obj fields', () => {
    interface NameCountSchema {
      name: string;
      count: number;
    }

    it('allows obj fields to be omitted', () => {
      type NameObj = {
        name: string;
      };

      const resolvers: Resolvers<NameCountSchema, NameObj> = {
        count: () => 3,
      };
    });

    it('allows resolvers to override fields', () => {
      interface NameNumberObj {
        name: number;
      }

      const resolvers: Resolvers<NameCountSchema, NameNumberObj> = {
        name: () => 'test',
        count: () => 3,
      };
    });

    it('does NOT typecheck the obj fields', () => {
      interface NameNumberObj {
        name: number;
      }

      // This typechecks but is not valid for GraphQL, since the implicit
      // resolution of "name" will be to a number, when the schema says it
      // should be a string.
      const resolvers: Resolvers<NameCountSchema, NameNumberObj> = {
        count: () => 3,
      };
    });
  });

  describe('overrides', () => {
    interface ChildSchema {
      name: string;
    }

    interface ChildObj {
      isChild: boolean;
    }

    interface ParentSchema {
      child: ChildSchema;
    }

    it('allows a resolver to return a value that matches the overrides', () => {
      const resolvers: Resolvers<ParentSchema, {}, {}, { child: ChildObj }> = {
        child: () => ({ isChild: true }),
      };
    });
  });
});

describe('ResolverInput', () => {
  interface NameCountSchema {
    name: string;
    count: number;
  }

  it('requires that the object have fields not in the resolvers', () => {
    interface NameNumberObj
      extends ResolverInput<NameCountSchema, typeof resolvers> {}

    const obj: NameNumberObj = {
      // This field is required because it’s not covered by the resolvers.
      count: () => Promise.resolve(4),
    };

    const resolvers = {
      name: (obj: NameNumberObj) => 'hi',
    };

    resolvers as Resolvers<NameCountSchema, NameNumberObj>;
  });

  it('is an empty type if the resolvers have covered everything', () => {
    interface NameNumberObj
      extends ResolverInput<NameCountSchema, typeof resolvers> {}

    const obj: NameNumberObj = {};

    const resolvers = {
      name: (obj: NameNumberObj) => 'hi',
      count: () => 4,
    };

    resolvers as Resolvers<NameCountSchema, NameNumberObj>;
  });

  it('allows resolvers to correct type for schema fields', () => {
    interface NameNumberObj
      extends ResolverInput<NameCountSchema, typeof resolvers> {
      // This is only allowed to be boolean because resolvers defines an
      // override. We use the Resolver typecheck below to enforce that the
      // override’s type is correct.
      name: boolean;
    }

    const resolvers = {
      name: (obj: NameNumberObj) => (obj.name ? 'true' : 'false'),
    };

    resolvers as Resolvers<NameCountSchema, NameNumberObj>;
  });
});

describe('FieldArgs', () => {
  interface NameCountSchema {
    name(args: { id: string }): string;
  }

  it('finds the args type of a function', () => {
    const args: FieldArgs<NameCountSchema['name']> = {
      id: '3',
    };
  });
});
