// @flow
/* eslint no-console: 0 */
import Hapi from 'hapi';
import Good from 'good';
import next from 'next';
import Boom from 'boom';
import fs from 'fs';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';

import { nextHandler, nextDefaultHandler } from './next-handlers';

import schema from './graphql';
import type { Context } from './graphql';

const port = parseInt(process.env.PORT || '3000', 10);

export default async function startServer() {
  const server = new Hapi.Server();
  const app = next({
    dev: process.env.NODE_ENV !== 'production',
  });

  await app.prepare();

  if (process.env.USE_SSL) {
    const tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };

    server.connection({ port: '3443', tls }, '0.0.0.0');
  } else {
    server.connection({ port }, '0.0.0.0');
  }

  server.auth.scheme('headerKeys', (s, { keys, header }: { header: string, keys: string[]}) => ({
    authenticate: (request, reply) => {
      const key = request.headers[header.toLowerCase()];
      if (!key) {
        reply(Boom.unauthorized(`Missing ${header} header`));
      } else if (keys.indexOf(key) === -1) {
        reply(Boom.unauthorized(`Key ${key} is not a valid key`));
      } else {
        reply.continue({ credentials: key });
      }
    },
  }));

  server.auth.strategy('apiKey', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  });

  server.register({
    register: Good,
    options: {
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{
              response: '*',
              log: '*',
            }],
          }, {
            module: 'good-console',
            args: [{
              color: process.env.NODE_ENV !== 'production',
            }],
          },
          'stdout',
        ],
      },
    },
  });

  server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      // We use a function here so that all of our services are request-scoped
      // and can cache within the same query but not leak to others.
      graphqlOptions: () => ({
        schema,
        context: ({}: Context),
      }),
      route: {
        cors: true,
        auth: 'apiKey',
      },
    },
  });

  server.register({
    register: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
        passHeader: `'X-API-KEY': '${process.env.WEB_API_KEY || ''}'`,
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: nextHandler(app, '/'),
  });

  server.route({
    method: 'GET',
    path: '/_next/{p*}',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/static/{p*}',
    handler: nextDefaultHandler(app),
  });

  await server.start();
  console.log(`> Ready on http://localhost:${port}`);
}
