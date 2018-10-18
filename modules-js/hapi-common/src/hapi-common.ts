import Path from 'path';
import Good from 'good';
import Boom from 'boom';
import { Squeeze } from 'good-squeeze';
import Console from 'good-console';
import {
  ServerAuthScheme,
  ServerRoute,
  Plugin,
  Request as HapiRequest,
  Server,
} from 'hapi';
import Rollbar from 'rollbar';

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
  header: string;
  keys: string[];
};

function checkHeaderKey(options: HeaderKeysOptions, request: HapiRequest) {
  const { header, keys } = options;
  const key = request.headers[header.toLowerCase()];

  if (!key) {
    throw Boom.unauthorized(`Missing ${header} header`);
  }

  if (keys.indexOf(key) === -1) {
    throw Boom.unauthorized(`Key ${key} is not a valid key`);
  }

  return key;
}

/**
 * Hapi auth scheme for checking a specific header to see if it has a key that’s
 * in a list.
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
      const key = checkHeaderKey(options as HeaderKeysOptions, request);

      return h.authenticated({ credentials: { key } });
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

      const cb = rollbarErr => {
        if (rollbarErr) {
          // eslint-disable-next-line no-console
          console.error(`Error reporting to rollbar, ignoring: ${rollbarErr}`);
        }
      };

      const error: Boom = response;

      // There isn’t much value in reporting 404s. We might also want to ignore
      // other 4xx errors, but for now we’ll keep them because they’re more
      // likely our fault than someone messing with requests.
      if (error.output.statusCode !== 404) {
        rollbar.error(error, request, cb);
      }

      return h.continue;
    };

    server.ext('onPreResponse', preResponse);
    server.expose('rollbar', rollbar);
  },
};

/**
 * Function to wrap a GraphQL options function such that errors in GraphQL
 * responses are sent to Rollbar.
 */
export const graphqlOptionsWithRollbar = (
  rollbar: Rollbar,
  optsFn: ((req: HapiRequest) => any) | Object
) => async (req: HapiRequest) => {
  try {
    const opts = await (optsFn instanceof Function ? optsFn(req) : optsFn);

    const oldFormatError = opts.formatError;
    opts.formatError = (e: any) => {
      const request = req.raw && req.raw.req;
      const extra = {
        graphql: req.payload,
      };

      // GraphQL wraps the original exception, so we pull it back out from
      // originalError since it has the right type and stacktrace and
      // everything.
      let err;
      if (e.originalError instanceof Error) {
        err = e.originalError;
      } else {
        err = e;
      }

      if (!err.silent) {
        rollbar.error(err, request, extra);
      }

      return oldFormatError ? oldFormatError(e) : e;
    };

    return opts;
  } catch (e2) {
    // This mostly catches exceptions that come from calling the optsFn. We want
    // to report them here because they lose stack trace and other info when
    // they’re handled by the Hapi GraphQL plugin.
    rollbar.error(e2);
    throw e2;
  }
};
