/* eslint no-console: 0 */
import Hapi from 'hapi';
const next = require('next');
import Boom from 'boom';
import Inert from 'inert';
import fs from 'fs';
import Path from 'path';
import { ApolloServer } from 'apollo-server-hapi';
import cleanup from 'node-cleanup';
import Stripe from 'stripe';
import { Client as PostmarkClient } from 'postmark';
import Rollbar from 'rollbar';

import {
  loggingPlugin,
  adminOkRoute,
  makeStaticAssetRoutes,
  headerKeys,
  HeaderKeysOptions,
  rollbarPlugin,
  persistentQueryPlugin,
  rollbarErrorExtension,
  HapiGraphqlContextFunction,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp, makeNextHandler } from '@cityofboston/hapi-next';

import {
  GRAPHQL_PATH_KEY,
  API_KEY_CONFIG_KEY,
  HAPI_INJECT_CONFIG_KEY,
} from '@cityofboston/next-client-common';

import decryptEnv from '@cityofboston/srv-decrypt-env';
import { DatabaseConnectionOptions } from '@cityofboston/mssql-common';

import {
  makeRegistryDbFactory,
  makeFixtureRegistryDbFactory,
  RegistryDbFactory,
} from './services/RegistryDb';

import Emails from './services/Emails';

import { processStripeEvent } from './stripe-events';

import schema, { Context, Source } from './graphql';
import { AnnotatedFilePart, PACKAGE_SRC_ROOT } from './util';
import { makeEmailTemplates } from './email/EmailTemplates';
import { UploadPayload, UploadResponse } from '../lib/upload-types';

type ServerArgs = {
  rollbar: Rollbar;
};

type Credentials = {
  source: Source;
};

declare module 'hapi' {
  interface AuthCredentials extends Credentials {
    key: string;
  }
}

const port = parseInt(process.env.PORT || '3000', 10);

export async function makeServer({ rollbar }: ServerArgs) {
  const serverOptions = {
    port,
    ...(process.env.USE_SSL
      ? {
          tls: {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.crt'),
          },
        }
      : {}),
  };

  const server = new Hapi.Server(serverOptions);

  // We load the config ourselves so that we can modify the runtime configs
  // from here.
  const config =
    process.env.NODE_ENV !== 'test' ? require('../../next.config.js') : {};

  config.publicRuntimeConfig = {
    ...config.publicRuntimeConfig,
    [GRAPHQL_PATH_KEY]: '/graphql',
    [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY || '',
    stripePublishableKey:
      process.env.STRIPE_PUBLISHABLE_KEY || 'fake-stripe-key',
  };

  config.serverRuntimeConfig = {
    ...config.serverRuntimeConfig,
    [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
  };

  const nextDev =
    process.env.NODE_ENV !== 'production' && !process.env.USE_BUILD;

  const app = next({
    dev: nextDev,
    quiet: process.env.NODE_ENV === 'test',
    conf: config,
  });

  const externalAssetUrl = process.env.ASSET_HOST
    ? `https://${process.env.ASSET_HOST}/registry-certs`
    : undefined;

  // These env variables are named "DATA" for historical reasons.
  const registryDbFactoryOpts: DatabaseConnectionOptions = {
    username: process.env.REGISTRY_DATA_DB_USER!,
    password: process.env.REGISTRY_DATA_DB_PASSWORD!,
    domain: process.env.REGISTRY_DATA_DB_DOMAIN,
    server: process.env.REGISTRY_DATA_DB_SERVER!,
    database: process.env.REGISTRY_DATA_DB_DATABASE!,
  };

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'fake-secret-key');
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (process.env.NODE_ENV === 'production' && !stripeWebhookSecret) {
    throw new Error('NEED A WEBHOOK SECRET IN PROD');
  }

  const postmarkClient = new PostmarkClient(
    process.env.POSTMARK_SERVER_API_TOKEN || 'fake-postmark-key'
  );

  const emails = new Emails(
    postmarkClient,
    rollbar,
    await makeEmailTemplates()
  );

  let registryDbFactory: RegistryDbFactory;

  const startup = async () => {
    const services = await Promise.all([
      registryDbFactoryOpts.server
        ? makeRegistryDbFactory(rollbar, registryDbFactoryOpts)
        : makeFixtureRegistryDbFactory('fixtures/registry-data/smith.json'),
      // We don’t run next for the server test
      process.env.NODE_ENV !== 'test' ? app.prepare() : Promise.resolve(),
    ]);

    registryDbFactory = services[0] as any;

    return async () => {
      await Promise.all([
        registryDbFactory.cleanup(),
        app.close(),
        server.stop(),
      ]);
    };
  };

  const apiKeys: { [key: string]: Credentials } = {};

  if (process.env.API_KEYS) {
    process.env.API_KEYS.split(',').forEach(k => {
      apiKeys[k] = { source: 'unknown' };
    });
  }

  if (process.env.WEB_API_KEY) {
    apiKeys[process.env.WEB_API_KEY] = {
      source: 'web',
    };
  }

  if (process.env.FULFILLMENT_API_KEY) {
    apiKeys[process.env.FULFILLMENT_API_KEY] = {
      source: 'fulfillment',
    };
  }

  server.auth.scheme('headerKeys', headerKeys);
  server.auth.strategy('apiHeaderKeys', 'headerKeys', {
    header: 'X-API-KEY',
    keys: apiKeys,
  } as HeaderKeysOptions);

  await server.register({
    plugin: rollbarPlugin,
    options: { rollbar },
  });

  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  await server.register(Inert);

  const contextFunction: HapiGraphqlContextFunction<Context> = ({
    request,
  }) => {
    const source = request.auth.credentials
      ? request.auth.credentials.source
      : 'unknown';

    return {
      registryDb: registryDbFactory.registryDb(),
      stripe,
      emails,
      rollbar,
      source,
    };
  };

  const apolloServer = new ApolloServer({
    schema,
    context: contextFunction,
    extensions: [rollbarErrorExtension(rollbar)],
  });

  await apolloServer.applyMiddleware({
    app: server,
    route: {
      cors: true,
      auth:
        Object.keys(apiKeys).length || process.env.NODE_ENV == 'staging'
          ? 'apiHeaderKeys'
          : false,
    },
  });

  await server.register({
    plugin: persistentQueryPlugin,
    options: {
      queriesDirPath: Path.resolve(
        PACKAGE_SRC_ROOT,
        'server',
        'queries',
        'fulfillment'
      ),
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (_, h) => h.redirect(process.env.ROOT_REDIRECT_URL || '/death'),
  });

  // small hack to keep people from finding the UI in prod, since it doesn’t
  // work
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.MARRIAGE_CERTS_ENABLED !== '1'
  ) {
    server.route({
      method: 'GET',
      path: '/marriage/{p*}',
      handler: () => {
        throw Boom.notFound();
      },
    });
  }

  server.route(adminOkRoute);

  // Stripe webhook handler. Used to reliably complete the order process when
  // charges succeed.
  server.route({
    method: 'POST',
    path: '/stripe',
    options: {
      payload: {
        output: 'data',
        parse: false,
      },
    },
    handler: async request => {
      try {
        await processStripeEvent(
          {
            registryDb: registryDbFactory.registryDb(),
            stripe,
            emails,
          },
          stripeWebhookSecret,
          request.headers['stripe-signature'],
          (request.payload as any).toString()
        );
        return '';
      } catch (e) {
        rollbar.error(e, request.raw.req);
        throw e;
      }
    },
  });

  server.route({
    method: 'POST',
    path: '/upload',
    options: {
      payload: {
        parse: true,
        allow: 'multipart/form-data',
        maxBytes: 10 * 1024 * 1024,
        // We don't want to time out these uploads in particular. The socket
        // will timeout after 2 mins of inactivity, which is fine.
        timeout: false,
        multipart: {
          output: 'annotated',
        },
      },
    },
    handler: async (req): Promise<UploadResponse> => {
      const {
        type,
        file,
        label,
        uploadSessionId,
      }: UploadPayload<AnnotatedFilePart> = req.payload as any;

      if (type === 'DC') {
        throw Boom.badData(
          'Can only upload attachments for birth or marriage certificates'
        );
      }

      if (!uploadSessionId) {
        throw Boom.badData('No uploadSessionId provided');
      }

      const db = registryDbFactory.registryDb();

      const attachmentKey = await db.uploadFileAttachment(
        type as any,
        uploadSessionId,
        label || null,
        file
      );

      return {
        attachmentKey,
        filename: file.filename,
      };
    },
  });

  server.route(makeRoutesForNextApp(app, '/', {}, {}, externalAssetUrl));
  server.route({
    method: 'GET',
    path: '/death/certificate/{id}',
    handler: makeNextHandler(app, '/death/certificate'),
  });

  server.route(makeStaticAssetRoutes());

  return {
    server,
    startup,
  };
}

export default async function startServer(args: ServerArgs) {
  await decryptEnv();

  const { server, startup } = await makeServer(args);

  const shutdown = await startup();
  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode);
      },
      err => {
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });

  await server.start();

  console.log(`> Ready on http://localhost:${port}`);
}

export {};
