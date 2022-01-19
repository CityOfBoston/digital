import Path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import Good from 'good';
import Boom from 'boom';
import { Squeeze } from 'good-squeeze';
import Console from 'good-console';
import { GraphQLExtension } from 'graphql-extensions';
import {
  ServerAuthScheme,
  ServerRoute,
  Plugin,
  Request as HapiRequest,
  Server,
  ResponseToolkit,
} from 'hapi';
import Rollbar from 'rollbar';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

export * from './browser-auth-plugin';

/**
 * Adds our preferred console logging that excludes health checks.
 *
 * @example await server.register(loggingPlugin);
 */
export const loggingPlugin = {
  plugin: Good,
  options: {
    reporters: {
      console: [
        {
          module: Squeeze,
          args: [
            {
              // Keep our health checks from appearing in logs
              response: { exclude: 'health' },
              log: '*',
            },
          ],
        },
        {
          module: Console,
          args: [
            {
              color: process.env.NODE_ENV !== 'production',
            },
          ],
        },
        'stdout',
      ],
    },
  },
};

/**
 * Standard health check route at /admin/ok for our apps, which returns a 200.
 *
 * @example server.route(adminOkRoute);
 */
export const adminOkRoute: ServerRoute = {
  method: 'GET',
  path: '/admin/ok',
  handler: () => 'ok',
  options: {
    // mark this as a health check so that it doesn’t get logged
    tags: ['health'],
    auth: false,
  },
};

/**
 * Generate routes to serve ./static/assets at /pathPrefix/assets and
 * ./storybook-static at /pathPrefix/storybook.
 *
 * Requires Inert to be registered.
 *
 * @param pathPrefix Must start and end with a slash
 */
export function makeStaticAssetRoutes(pathPrefix: string = '/'): ServerRoute[] {
  return [
    {
      method: 'GET',
      path: `${pathPrefix}assets/{path*}`,
      options: {
        auth: false,
      },
      handler: (request, h: any) => {
        if (!request.params.path || request.params.path.indexOf('..') !== -1) {
          throw Boom.forbidden();
        }

        const p = Path.join(
          'static',
          'assets',
          ...request.params.path.split('/')
        );

        return h
          .file(p)
          .header('Cache-Control', 'public, max-age=3600, s-maxage=600');
      },
    },
    {
      method: 'GET',
      path: `${pathPrefix}storybook/{path*}`,
      options: {
        auth: false,
      },
      handler: {
        directory: {
          path: 'storybook-static',
          redirectToSlash: true,
        },
      },
    },
  ];
}

export type HeaderKeysOptions = {
  /**
   * HTTP header to look for API keys in.
   */
  header: string;
  /**
   * If you pass an object, the keys are api keys and the values will be merged
   * into the auth.credentials object on successful auth.
   */
  keys: string[] | { [key: string]: Object };
};

/**
 * Returns a credentials object, or explodes with Boom.unauthorized.
 */
function checkHeaderKey(
  options: HeaderKeysOptions,
  request: HapiRequest
): Object {
  const { header, keys } = options;
  const key = request.headers[header.toLowerCase()];

  if (!key) {
    throw Boom.unauthorized(`Missing ${header} header`);
  }

  if (Array.isArray(keys)) {
    if (keys.indexOf(key) === -1) {
      throw Boom.unauthorized(`Key ${key} is not a valid key`);
    }

    return { key };
  } else {
    const creds = keys[key];
    if (!creds) {
      throw Boom.unauthorized(`Key ${key} is not a valid key`);
    }

    return {
      key,
      ...creds,
    };
  }
}

/**
 * Hapi auth scheme for checking a specific header to see if it has a key that’s
 * in a list.
 *
 * The keys config property can either be an array of strings (keys) or an object
 * mapping keys to an object that will be merged into the auth.credentials object
 * on successful authentication.
 *
 * @example
 * import { headerKeys, HeaderKeysOptions } from '@cityofboston/hapi-common';
 * server.auth.scheme('headerKeys', headerKeys);
 * server.auth.strategy('apiHeaderKeys', 'headerKeys', {
 *   header: 'X-API-KEY',
 *   keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
 * } as HeaderKeysOptions);
 */
export const headerKeys: ServerAuthScheme = (_, options) => {
  if (!options) {
    throw new Error('Missing options for headerKeys auth scheme');
  }

  return {
    authenticate: (request, h) => {
      const credentials = checkHeaderKey(options as HeaderKeysOptions, request);

      return h.authenticated({ credentials });
    },
  };
};

// Plugin that errors when the header doesn't have a correct key. This is very
// similar to the auth plugin version, but can be used when you want to also
// apply another auth strategy to the requests (like checking a session).
//
// To use this, add a "headerKeys: true" to the route's plugin options.
export const headerKeysPlugin: Plugin<HeaderKeysOptions> = {
  name: 'HeaderKeys',
  register: async (server, options) => {
    server.ext('onPreAuth', (request, h) => {
      const pluginOptions = request.route.settings.plugins;

      if (pluginOptions && (pluginOptions as any).headerKeys) {
        checkHeaderKey(options, request);
      }

      return h.continue;
    });
  },
};

/**
 * Hapi plugin to report exceptions to Rollbar. Pass "rollbar" in the options
 * hash.
 *
 * @see https://docs.rollbar.com/docs/javascript#section-using-hapi
 */
export const rollbarPlugin = {
  name: 'rollbar',

  register: async function(server: Server, { rollbar }: { rollbar: Rollbar }) {
    const preResponse = (request, h) => {
      const response = request.response;

      if (!rollbar || !response.isBoom) {
        return h.continue;
      }

      const error: Boom = response;

      const cb = rollbarErr => {
        if (rollbarErr) {
          // eslint-disable-next-line no-console
          console.error(error);
          // eslint-disable-next-line no-console
          console.error(`Could not report to Rollbar because: ${rollbarErr}`);
        }
      };

      // There isn’t much value in reporting 404s. We might also want to ignore
      // other 4xx errors, but for now we’ll keep them because they’re more
      // likely our fault than someone messing with requests.
      if (error.output.statusCode !== 404) {
        rollbar.error(
          error,
          request,
          {
            custom: {
              data: error.data,
            },
          },
          cb
        );
      }

      return h.continue;
    };

    server.ext('onPreResponse', preResponse);
    server.expose('rollbar', rollbar);
  },
};

/**
 * Object that includes some subset of IncomingMessage and Apollo’s Request
 * object, which Rollbar will interpret as an HTTP request object.
 *
 * @see https://docs.rollbar.com/docs/nodejs#section-server-usage
 */
type RollbarRequest = {
  headers: Object;
  url?: string;
  method?: string;
};

const reportGraphqlError = (
  rollbar: Rollbar,
  e: any,
  request: RollbarRequest,
  query: any,
  variables: any
) => {
  // GraphQL wraps the original exception, so we pull it back out from
  // originalError since it has the right type and stacktrace and
  // everything.
  let err;
  if (e.originalError instanceof Error) {
    err = e.originalError;
  } else {
    err = e;
  }

  const data = (err as any).data;
  const extra = {
    graphql: {
      query,
      variables,
    },
    custom: data ? { data } : {},
  };

  if (!err.silent) {
    rollbar.error(err, request, extra);
  }
};

/**
 * Extension for ApolloServer that sends GraphQL errors to Rollbar. We implement
 * this as an extension rather than a formatError method because the latter
 * doesn’t give us access to the HTTP request or query information, which is
 * valuable to report.
 */
export const rollbarErrorExtension = (
  rollbar: Rollbar
): (() => GraphQLExtension) => () => {
  let request: RollbarRequest;
  let queryString: string | undefined;
  let variables: Object | undefined;

  return {
    requestDidStart(opts) {
      // We need to manually pull these off because they come through accessors.
      // Just passing opts.request as the RollbarRequest does not cause
      // headers/url/method to get sent to Rollbar.
      request = {
        headers: opts.request.headers,
        url: opts.request.url,
        method: opts.request.method,
      };
      queryString = opts.queryString;
      variables = opts.variables;
    },
    didEncounterErrors(errors) {
      try {
        errors.forEach(e => {
          reportGraphqlError(rollbar, e, request, queryString, variables);
        });
      } catch (e) {
        rollbar.error(e as any);
      }
    },
  };
};

type PersistentQueryOptions = {
  /**
   * GraphQL path. Defaults to "/graphql"
   */
  path?: string;
  queries?: { [id: string]: string };
  /** Convenience option to load queries from a directory of *.graphql files */
  queriesDirPath?: string;
};

/**
 * Plugin to support "persistent queries" on a GraphQL endpoint. This allows an
 * app to define queries by IDs. The caller then posts a JSON request with an
 * "id" property rather than a "query" property.
 *
 * This was written before we ported to Apollo Server 2, which has built-in
 * persisted query support.
 */
export const persistentQueryPlugin: Plugin<PersistentQueryOptions> = {
  name: 'persistentQueryPlugin',
  version: '0.0.0',
  register: async function(server: Server, { path, queries, queriesDirPath }) {
    const loadedQueries = {};

    if (!queries) {
      if (queriesDirPath) {
        await Promise.all(
          (await readdir(queriesDirPath)).map(async p => {
            const m = p.match(/(.*)\.graphql/);
            if (m) {
              loadedQueries[m[1]] = await readFile(
                Path.resolve(queriesDirPath, p),
                'utf-8'
              );
            }
          })
        );
      } else {
        throw new Error('Must specify either queries or queriesPath');
      }
    } else if (queriesDirPath) {
      throw new Error('Must not provide both queries and queriesPath');
    } else {
      Object.assign(loadedQueries, queries);
    }

    // Based on https://github.com/apollographql/persistgraphql/blob/master/README.md#server-side
    server.ext('onPreHandler', (req, h) => {
      const id = req.payload && (req.payload as any).id;

      if (
        req.method === 'post' &&
        req.url.pathname === (path || '/graphql') &&
        id
      ) {
        const query = loadedQueries[id];
        if (!query) {
          throw Boom.notFound(`Could not find query with id ${id}`);
        }

        (req.payload as any).query = query;
      }

      return h.continue;
    });
  },
};

/**
 * Type to help typecheck the `context` function passed to `ApolloServer`.
 *
 * Use this to ensure that the function you have to generate the context is
 * returning the same type that your resolvers are expecting.
 */
export type HapiGraphqlContextFunction<Context> = ({
  request,
  h,
}: {
  request: HapiRequest;
  h: ResponseToolkit;
}) => Context;
