import {
  Resolvers,
  ResolvableWith,
  DefaultResolvable,
} from './graphql-typescript';

/*
  The tests in here don’t assert anything useful. The real test is whether this
  file typechecks at all.

  That also means that we’re not able to test when things shouldn’t typecheck.
*/

describe('Resolvers', () => {
  describe('schema with literal child', () => {
    interface Root {
      version: string;
      children: Child[];
    }

    interface Child {
      id: string;
      name: string;
    }

    test('root returns values', () => {
      type RootResolvers = Resolvers<Root>;
      const resolvers: RootResolvers = {
        version: () => '1',
        children: () => [],
      };
      expect(resolvers).toBeDefined();
    });

    test('root returns promises', () => {
      const resolvers: Resolvers<Root> = {
        version: async () => '1',
        children: async () => [],
      };
      expect(resolvers).toBeDefined();
    });

    test('root returns literal child', () => {
      const resolvers: Resolvers<Root> = {
        version: () => '1',
        children: () => [
          {
            // Removing either of these fields will fail typechecking
            id: '364831',
            name: 'Danielle Cage',
          },
        ],
      };
      expect(resolvers).toBeDefined();
    });

    test('root can take an input', () => {
      interface RootWithInput extends ResolvableWith<RootInput> {
        version: string;
        children: Child[];
      }
      interface RootInput {
        getVersion: () => string;
      }

      const resolvers: Resolvers<RootWithInput> = {
        version: ({ getVersion }) => getVersion(),
        children: () => [],
      };
      expect(resolvers).toBeDefined();
    });

    test('root can take a context', () => {
      interface Context {
        getVersion: () => string;
      }

      const resolvers: Resolvers<Root, Context> = {
        version: (_obj, _args, { getVersion }) => getVersion(),
        children: () => [],
      };
      expect(resolvers).toBeDefined();
    });

    test('root can take arguments', () => {
      interface RootWithArguments {
        version: string;
        children(args: { name: string }): Child[];
      }

      const resolvers: Resolvers<RootWithArguments> = {
        version: () => '3',
        children: (_, { name }) => [{ id: '3', name }],
      };
      expect(resolvers).toBeDefined();
    });

    test('root can have a boolean', () => {
      // This is a regression test to handle the case where the field’s type is
      // actually a type union. We want the resolver function to be defined as
      // returning the union, rather than having a union of resolver functions,
      // each of which can only return one element of the union (e.g. always
      // return true or always return false).
      //
      // This can arise because of how TypeScript distributes conditional types
      // over type unions.

      interface RootWithBoolean {
        ok: boolean;
      }

      const resolvers: Resolvers<RootWithBoolean> = {
        ok: () => Math.random() > 0.5,
      };
      expect(resolvers).toBeDefined();
    });

    test('boolean field takes args', () => {
      interface RootWithBoolean {
        ok(args: { num: number }): boolean;
      }

      const resolvers: Resolvers<RootWithBoolean> = {
        ok: (_, { num }) => num > 0.5,
      };
      expect(resolvers).toBeDefined();
    });
  });

  describe('schema with resolvable child', () => {
    test('root returns child input', () => {
      interface Root {
        version: string;
        children: Array<Child | null> | null;
      }

      interface Child extends ResolvableWith<ChildInput> {
        id: string;
        name: string | null;
      }

      interface ChildInput {
        id: number;
      }

      const rootResolvers: Resolvers<Root> = {
        version: () => '3',
        children: () => [null, { id: 3 }],
      };

      const childResolvers: Resolvers<Child> = {
        // The argument to this function is of type ChildInput
        id: ({ id }) => `${id}`,
        name: () => 'Danielle Cage',
      };

      expect(rootResolvers).toBeDefined();
      expect(childResolvers).toBeDefined();
    });

    test('ResolvableWith can take a type union', () => {
      interface Root {
        version: string;
        children: Array<Child>;
      }

      interface Child extends ResolvableWith<ChildInput | number> {
        id: string;
        name: string | null;
      }

      interface ChildInput {
        id: number;
      }

      const rootResolvers: Resolvers<Root> = {
        version: () => '3',
        // We can return number, ChildInput, or both.
        children: () => [{ id: 3 }, 4],
      };

      const childResolvers: Resolvers<Child> = {
        // Now the first argument is either a number or a ChildInput.
        id: input => (typeof input === 'number' ? `${input}` : `${input.id}`),
        name: () => 'Danielle Cage',
      };

      expect(rootResolvers).toBeDefined();
      expect(childResolvers).toBeDefined();
    });
  });
});

describe('DefaultResolvable', () => {
  interface Parent {
    child: Child;
  }

  interface Child extends ResolvableWith<DefaultResolvable<Child>> {
    name: string;
  }

  test('default-resolvable can just be the instance', () => {
    const resolvers: Resolvers<Parent> = {
      child: () => ({ name: 'Mew' }),
    };
    expect(resolvers).toBeDefined();
  });

  test('default-resolvable can be a Promise', () => {
    const resolvers: Resolvers<Parent> = {
      child: () => ({ name: Promise.resolve('Mew') }),
    };
    expect(resolvers).toBeDefined();
  });

  test('default-resolvable can be a function', () => {
    const resolvers: Resolvers<Parent> = {
      child: () => ({ name: (_args, _context) => Promise.resolve('Mew') }),
    };
    expect(resolvers).toBeDefined();
  });
});
