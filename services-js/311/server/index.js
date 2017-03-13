// @flow
/* eslint no-console: 0 */
import rollbar from 'rollbar';
import Hapi from 'hapi';
import Good from 'good';
import next from 'next';
import dotenv from 'dotenv';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';

import { nextHandler, nextDefaultHandler } from './next-handlers';
import Open311 from './services/Open311';

import schema from './graphql';
import type { Context } from './graphql';

dotenv.config();

rollbar.handleUncaughtExceptionsAndRejections(process.env.ROLLBAR_SERVER_KEY, {
  environment: process.env.HEROKU_PIPELINE || process.env.NODE_ENV || 'development',
  enabled: (process.env.NODE_ENV || 'development') !== 'development',
});

const port = parseInt(process.env.PORT || '3000', 10);

(async function startServer() {
  const server = new Hapi.Server();
  const app = next({
    dev: process.env.NODE_ENV !== 'production',
  });

  await app.prepare();

  server.connection({ port }, '0.0.0.0');

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
      graphqlOptions: (req) => ({
        schema,
        context: ({
          open311: new Open311(process.env['311_ENDPOINT'], process.env['311_KEY']),
        }: Context),
        formatError: (e) => {
          rollbar.handleError(e, req, (err) => {
            if (err) {
              console.error('Error sending exception to rollbar', err);
            }
          });
          return e;
        },
      }),
      route: {
        cors: true,
      },
    },
  });

  server.register({
    register: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: nextHandler(app, '/report'),
  });

  server.route({
    method: 'GET',
    path: '/report/{code}',
    handler: nextHandler(app, '/report'),
  });

  server.route({
    method: 'GET',
    path: '/report/{code}/{stage}',
    handler: (request, reply) => reply.redirect(`/report/${request.params.code}`),
  });

  server.route({
    method: 'GET',
    path: '/lookup',
    handler: nextHandler(app, '/lookup'),
  });

  server.route({
    method: 'GET',
    path: '/_next/{p*}',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/__webpack_hmr',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/_webpack/{p*}',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/static/{p*}',
    handler: nextDefaultHandler(app),
  });

  await server.start();
  console.log(`> Ready on http://localhost:${port}`);
}()).catch((err) => {
  console.error('Error starting server');
  console.error(err);
});
