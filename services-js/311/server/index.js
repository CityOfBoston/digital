// @flow
/* eslint no-console: 0 */

import Hapi from 'hapi';
import next from 'next';
import dotenv from 'dotenv';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';

import { nextHandler, nextDefaultHandler } from './next-handlers';
import Open311 from './services/Open311';

import schema from './graphql';
import type { Context } from './graphql';

dotenv.config();

const open311 = new Open311(process.env['311_ENDPOINT'], process.env['311_KEY']);

(async function startServer() {
  const server = new Hapi.Server();
  const app = next({
    dev: process.env.NODE_ENV !== 'production',
  });

  await app.prepare();

  server.connection({ port: 3000 });

  server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema,
        context: ({
          open311,
        }: Context),
      },
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
    handler: nextHandler(app, '/report', { step: 'report' }),
  });

  server.route({
    method: 'POST',
    path: '/report/submit',
    handler: nextHandler(app, '/report', { step: 'submit' }),
  });

  server.route({
    method: 'GET',
    path: '/report/{p*}',
    handler: (request, reply) => reply.redirect('/'),
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

  await server.start();
  console.log('> Ready on http://localhost:3000');
}()).catch((err) => {
  console.error('Error starting server');
  console.error(err);
});
