/* eslint no-console: 0 */
import Hapi from 'hapi';
import Inert from 'inert';
import next from 'next';
import Boom from 'boom';
import fs from 'fs';
import Path from 'path';
import { graphqlHapi, graphiqlHapi } from 'apollo-server-hapi';

import decryptEnv from '@cityofboston/srv-decrypt-env';
import {
  headerKeys,
  HeaderKeysOptions,
  loggingPlugin,
} from '@cityofboston/hapi-common';

import { nextHandler, nextDefaultHandler } from './next-handlers';
import { opbeatWrapGraphqlOptions } from './opbeat-graphql';
import { Open311 } from './services/Open311';
import { ArcGIS } from './services/ArcGIS';
import { Prediction } from './services/Prediction';
import { Elasticsearch } from './services/Elasticsearch';
import { Salesforce } from './services/Salesforce';

import schema, { Context } from './graphql';
import sitemapHandler from './sitemap';
import legacyServiceRedirectHandler from './legacy-service-redirect';
import {
  HAPI_INJECT_CONFIG_KEY,
  API_KEY_CONFIG_KEY,
  GRAPHQL_PATH_KEY,
} from '@cityofboston/next-client-common';

import {
  makeNextConfig,
  PublicRuntimeConfig,
  ServerRuntimeConfig,
} from '../lib/config';

const port = parseInt(process.env.PORT || '3000', 10);

export default async function startServer({ opbeat }: any) {
  await decryptEnv();

  const serverConfig: Hapi.ServerOptions = {
    port,
    tls: undefined,
  };

  if (process.env.USE_SSL) {
    serverConfig.tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };
  }

  const server = new Hapi.Server(serverConfig);

  // We load the config ourselves so that we can modify the runtime configs
  // from here.
  const config = require('../../next.config.js');
  const customConfig = makeNextConfig(process.env);

  const publicRuntimeConfig: PublicRuntimeConfig = {
    ...customConfig.publicRuntimeConfig,
    [GRAPHQL_PATH_KEY]: '/graphql',
    [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY || '',
  };

  const serverRuntimeConfig: ServerRuntimeConfig = {
    ...customConfig.serverRuntimeConfig,
    [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
  };

  config.publicRuntimeConfig = {
    ...config.publicRuntimeConfig,
    ...publicRuntimeConfig,
  };

  config.serverRuntimeConfig = {
    ...config.serverRuntimeConfig,
    ...serverRuntimeConfig,
  };

  const app = next({
    dev: process.env.NODE_ENV !== 'production',
    config,
  });

  const nextAppPreparation = app.prepare();

  if (
    process.env.ELASTICSEARCH_URL &&
    process.env.ELASTICSEARCH_URL.endsWith('.amazonaws.com')
  ) {
    Elasticsearch.configureAws(process.env.AWS_REGION);
  }

  const elasticsearch = new Elasticsearch(
    process.env.ELASTICSEARCH_URL,
    process.env.ELASTICSEARCH_INDEX,
    opbeat
  );

  const salesforce = process.env.SALESFORCE_OAUTH_URL
    ? new Salesforce(
        process.env.SALESFORCE_OAUTH_URL,
        process.env.SALESFORCE_CONSUMER_KEY,
        process.env.SALESFORCE_CONSUMER_SECRET,
        process.env.SALESFORCE_API_USERNAME,
        process.env.SALESFORCE_API_PASSWORD,
        process.env.SALESFORCE_API_SECURITY_TOKEN
      )
    : null;

  if (salesforce) {
    // We block startup on making sure we can authenticate to Salesforce.
    await salesforce.reauthorize();
    console.log('Successfully authenticated to Salesforce');
  }

  server.auth.scheme('headerKeys', headerKeys);
  server.auth.strategy('apiHeaderKeys', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  } as HeaderKeysOptions);

  await server.register(loggingPlugin);

  await server.register(Inert);

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      // We use a function here so that all of our services are request-scoped
      // and can cache within the same query but not leak to others.
      graphqlOptions: opbeatWrapGraphqlOptions(opbeat, () => ({
        schema,
        context: {
          open311: new Open311(
            process.env.PROD_311_ENDPOINT,
            process.env.PROD_311_KEY,
            salesforce,
            opbeat
          ),

          arcgis: new ArcGIS(process.env.ARCGIS_ENDPOINT, opbeat),
          prediction: new Prediction(
            process.env.PREDICTION_ENDPOINT,
            process.env.NEW_PREDICTION_ENDPOINT,
            opbeat
          ),

          // Elasticsearch maintains a persistent connection, so we re-use it
          // across requests.
          elasticsearch,
          opbeat,
        } as Context,
      })),

      route: {
        cors: true,
        auth: 'apiHeaderKeys',
      },
    },
  });

  await server.register({
    plugin: graphiqlHapi,
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
    handler: (_, h) => h.redirect('/'),
  });

  server.route({
    method: 'GET',
    path: '/request/{code}',
    handler: nextHandler(app, '/request'),
  });

  server.route({
    method: 'GET',
    path: '/request/{code}/{stage}',
    handler: (request, h) => h.redirect(`/request/${request.params.code}`),
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

  // Old Connected Bits URLs
  server.route({
    method: 'GET',
    path: '/reports/list_services',
    handler: (_, h) => h.redirect('/services'),
  });

  server.route({
    method: 'GET',
    path: '/reports/new',
    handler: legacyServiceRedirectHandler,
  });

  server.route({
    method: 'GET',
    // This domain is chosen to match the existing 311.boston.gov URLs
    path: '/reports/{id}',
    handler: nextHandler(app, '/reports'),
  });

  server.route({
    method: 'GET',
    path: '/faq',
    handler: nextHandler(app, '/faq'),
  });

  // 404 page
  server.route({
    method: '*',
    path: '/{p*}',
    handler: (handleNextRequest => (request, h) => {
      const {
        raw: { res },
      } = request;

      res.statusCode = 404;

      return handleNextRequest(request, h);
    })(nextHandler(app, '/_error')),
  });

  server.route({
    method: 'GET',
    path: '/sitemap.xml',
    handler: sitemapHandler(
      new Open311(
        process.env.PROD_311_ENDPOINT,
        process.env.PROD_311_KEY,
        null,
        opbeat
      )
    ),
  });

  server.route({
    method: 'GET',
    path: '/_next/{p*}',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: (_, h) => h.file('static/favicon.ico'),
  });

  server.route({
    method: 'GET',
    path: '/robots.txt',
    handler: (_, h) =>
      h.file(
        process.env.HEROKU_PIPELINE === 'staging'
          ? 'static/robots-staging.txt'
          : 'static/robots-production.txt'
      ),
  });

  server.route({
    method: 'GET',
    path: '/assets/{path*}',
    handler: (request, h) => {
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
  });

  server.route({
    method: 'GET',
    path: '/admin/ok',
    handler: () => 'ok',
    options: {
      // mark this as a health check so that it doesn’t get logged
      tags: ['health'],
    },
  });

  await nextAppPreparation;

  await server.start();
  console.log(`> Ready on http://localhost:${port}`);
}
