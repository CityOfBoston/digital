// @flow
/* eslint no-console: 0 */
import Hapi from 'hapi';
import Good from 'good';
import next from 'next';
import Boom from 'boom';
import fs from 'fs';
import Inert from 'inert';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import acceptLanguagePlugin from 'hapi-accept-language';

import { nextHandler, nextDefaultHandler } from './next-handlers';
import { opbeatWrapGraphqlOptions } from './opbeat-graphql';
import Open311 from './services/Open311';
import ArcGIS from './services/ArcGIS';
import Prediction from './services/Prediction';
import SearchBox from './services/SearchBox';

import schema from './graphql';
import type { Context } from './graphql';
import sitemapHandler from './sitemap';

const port = parseInt(process.env.PORT || '3000', 10);

export default async function startServer({ opbeat }: any) {
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

  server.register(Inert);
  server.register(acceptLanguagePlugin);

  server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      // We use a function here so that all of our services are request-scoped
      // and can cache within the same query but not leak to others.
      graphqlOptions: opbeatWrapGraphqlOptions(opbeat, () => ({
        schema,
        context: ({
          open311: new Open311(process.env.PROD_311_ENDPOINT, process.env.PROD_311_KEY, opbeat),
          publicOpen311: new Open311(process.env.LEGACY_311_ENDPOINT, null, opbeat),
          arcgis: new ArcGIS(process.env.ARCGIS_ENDPOINT, opbeat),
          prediction: new Prediction(process.env.PREDICTION_ENDPOINT, opbeat),
          searchBox: new SearchBox(process.env.SEARCHBOX_URL, process.env.ELASTICSEARCH_INDEX, opbeat),
        }: Context),
      })),
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
    handler: nextHandler(app, '/request'),
  });

  server.route({
    method: 'GET',
    path: '/request',
    handler: (request, reply) => reply.redirect('/'),
  });

  server.route({
    method: 'GET',
    path: '/request/{code}',
    handler: nextHandler(app, '/request'),
  });

  server.route({
    method: 'GET',
    path: '/request/{code}/{stage}',
    handler: (request, reply) => reply.redirect(`/request/${request.params.code}`),
  });

  server.route({
    method: 'GET',
    path: '/translate',
    handler: nextHandler(app, '/request', { translate: '1' }),
  });

  server.route({
    method: 'GET',
    path: '/services',
    handler: nextHandler(app, '/services'),
  });

  server.route({
    method: 'GET',
    path: '/search',
    handler: nextHandler(app, '/search'),
  });

  server.route({
    method: 'GET',
    path: '/case/{id}',
    handler: nextHandler(app, '/case'),
  });

  server.route({
    method: 'GET',
    path: '/faq',
    handler: nextHandler(app, '/faq'),
  });

  server.route({
    method: 'GET',
    path: '/sitemap.xml',
    handler: sitemapHandler(new Open311(process.env.PROD_311_ENDPOINT, process.env.PROD_311_KEY, opbeat)),
  });

  server.route({
    method: 'GET',
    path: '/_next/{p*}',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: (request, reply) => reply.file('static/favicon.ico'),
  });

  server.route({
    method: 'GET',
    path: '/robots.txt',
    handler: (request, reply) => reply.file(process.env.HEROKU_PIPELINE === 'staging' ? 'static/robots-staging.txt' : 'static/robots-production.txt'),
  });

  server.route({
    method: 'GET',
    path: '/static/{p*}',
    handler: nextDefaultHandler(app, { cache: true }),
  });

  await server.start();
  console.log(`> Ready on http://localhost:${port}`);
}
