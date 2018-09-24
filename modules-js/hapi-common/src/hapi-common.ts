import Good from 'good';
import Boom from 'boom';
import { Squeeze } from 'good-squeeze';
import Console from 'good-console';
import {
  ServerAuthScheme,
  ServerRoute,
  Plugin,
  Request as HapiRequest,
} from 'hapi';

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
