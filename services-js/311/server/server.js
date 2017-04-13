// @flow
/* eslint no-console: 0 */
import Hapi from 'hapi';
import Good from 'good';
import next from 'next';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';

import { nextHandler, nextDefaultHandler } from './next-handlers';
import Open311 from './services/Open311';
import Swiftype from './services/Swiftype';
import ArcGIS from './services/ArcGIS';
import Prediction from './services/Prediction';

import schema from './graphql';
import type { Context } from './graphql';

const port = parseInt(process.env.PORT || '3000', 10);

export default async function startServer({ opbeat }: any) {
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
          open311: new Open311(process.env['311_ENDPOINT'], process.env['311_KEY'], opbeat),
          swiftype: new Swiftype(process.env.SWIFTYPE_API_KEY, process.env.SWIFTYPE_ENGINE_SLUG, opbeat),
          arcgis: new ArcGIS(process.env.ARCGIS_ENDPOINT, opbeat),
          prediction: new Prediction(process.env.PREDICTION_ENDPOINT, opbeat),
        }: Context),
        formatError: (e) => {
          opbeat.captureError(e, { request: req }, (err, url) => {
            if (err) {
              console.error('Error sending exception to Opbeat', err);
            } else if (url) {
              console.info(`Error logged to Opbeat: ${url}`);
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
    path: '/service',
    handler: (request, reply) => reply.redirect('/'),
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
    path: '/faq',
    handler: nextHandler(app, '/faq'),
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
