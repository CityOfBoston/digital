// @flow
/* eslint no-console: 0 */
import AWS from 'aws-sdk';
import os from 'os';
import fetch from 'node-fetch';

import Hapi from 'hapi';
import Good from 'good';
import next from 'next';
import Boom from 'boom';
import Inert from 'inert';
import fs from 'fs';
import Path from 'path';
import { graphqlHapi, graphiqlHapi } from 'graphql-server-hapi';
import cleanup from 'node-cleanup';

import { nextHandler, nextDefaultHandler } from './next-handlers';
import addRequestAdditions from './request-additions';
import {
  makeRegistryFactory,
  makeFixtureRegistryFactory,
} from './services/Registry';
import type { RegistryFactory } from './services/Registry';

import schema from './graphql';
import type { Context } from './graphql';

import { opbeatWrapGraphqlOptions } from './opbeat-graphql';

type Opbeat = $Exports<'opbeat'>;

type ServerArgs = {
  opbeat: Opbeat,
};

const port = parseInt(process.env.PORT || '3000', 10);

// Decrypts any vars that end with "_KMS_ENCRYPTED"
function decryptConfig(): Promise<void> {
  if (!process.env.AWS_REGION) {
    console.log('AWS region not set, not decrypting environment variables');
    return Promise.resolve();
  }

  AWS.config.update({ region: process.env.AWS_REGION });
  const kms = new AWS.KMS();

  return Promise.all(
    Object.keys((process.env: any)).map(envKey => {
      const match = envKey.match(/(.*)_KMS_ENCRYPTED$/);

      if (!match) {
        return Promise.resolve();
      }

      const decryptedEnvKey = match[1];

      const decryptParams = {
        CiphertextBlob: Buffer.from(process.env[envKey] || '', 'base64'),
      };

      return new Promise((resolve, reject) => {
        kms.decrypt(decryptParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            process.env[decryptedEnvKey] = data.Plaintext.toString();
            resolve();
          }
        });
      });
    })
  ).then(() => {});
}

// https://opbeat.com/docs/api/intake/v1/#release-tracking
async function reportDeployToOpbeat(opbeat, appId) {
  if (
    appId &&
    process.env.OPBEAT_ORGANIZATION_ID &&
    process.env.OPBEAT_SECRET_TOKEN &&
    process.env.GIT_BRANCH &&
    process.env.GIT_REVISION
  ) {
    try {
      const res = await fetch(
        `https://opbeat.com/api/v1/organizations/${process.env
          .OPBEAT_ORGANIZATION_ID}/apps/${appId}/releases/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${process.env.OPBEAT_SECRET_TOKEN}`,
          },
          body: [
            `rev=${process.env.GIT_REVISION}`,
            `branch=${encodeURIComponent(process.env.GIT_BRANCH)}`,
            `machine=${encodeURIComponent(os.hostname())}`,
            `status=machine-completed`,
          ].join('&'),
        }
      );
      console.log(
        `Reported ${appId} deploy to Opbeat:`,
        JSON.stringify(await res.json())
      );
    } catch (err) {
      // We swallow the error because we won't interrupt startup because we
      // couldn't report the release.
      console.error(`Error reporting ${appId} deploy to Opbeat`);

      // bwaaaaaa
      opbeat.captureError(err);
    }
  }
}

export function makeServer({ opbeat }: ServerArgs) {
  const server = new Hapi.Server();

  if (process.env.USE_SSL) {
    const tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };

    server.connection({ port, tls }, '0.0.0.0');
  } else {
    server.connection({ port }, '0.0.0.0');
  }

  const app = next({
    dev: process.env.NODE_ENV !== 'production',
    quiet: process.env.NODE_ENV === 'test',
  });

  const registryFactoryOpts = {
    user: process.env.REGISTRY_DB_USER,
    password: process.env.REGISTRY_DB_PASSWORD,
    domain: process.env.REGISTRY_DB_DOMAIN,
    server: process.env.REGISTRY_DB_SERVER,
    database: process.env.REGISTRY_DB_DATABASE,
  };

  let registryFactory: RegistryFactory;

  const startup = async () => {
    const services = await Promise.all([
      registryFactoryOpts.server
        ? makeRegistryFactory(registryFactoryOpts)
        : makeFixtureRegistryFactory('fixtures/registry/smith.json'),
      app.prepare(),
    ]);

    registryFactory = services[0];

    return async () => {
      await Promise.all([
        registryFactory.cleanup(),
        app.close(),
        server.stop(),
      ]);
    };
  };

  server.auth.scheme(
    'headerKeys',
    (s, { keys, header }: { header: string, keys: string[] }) => ({
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
    })
  );

  server.auth.strategy('apiKey', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS
      ? process.env.API_KEYS.split(',')
      : ['test-api-key'],
  });

  if (process.env.NODE_ENV !== 'test') {
    server.register({
      register: Good,
      options: {
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [
                {
                  // Keep our health checks from appearing in logs
                  response: { exclude: 'health' },
                  log: '*',
                },
              ],
            },
            {
              module: 'good-console',
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
    });
  }

  server.register(Inert);

  server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      // We use a function here so that all of our services are request-scoped
      // and can cache within the same query but not leak to others.
      graphqlOptions: opbeatWrapGraphqlOptions(opbeat, () => ({
        schema,
        context: ({
          registry: registryFactory.registry(),
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
        passHeader: `'X-API-KEY': '${process.env.WEB_API_KEY ||
          'test-api-key'}'`,
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply.redirect('/death'),
  });

  server.route({
    method: 'GET',
    path: '/admin/ok',
    handler: (request, reply) => reply('ok'),
    config: {
      // mark this as a health check so that it doesn’t get logged
      tags: ['health'],
    },
  });

  server.route({
    method: 'GET',
    path: '/death/certificate/{id}',
    handler: addRequestAdditions(nextHandler(app, '/death/certificate')),
  });

  server.route({
    method: 'GET',
    path: '/{p*}',
    handler: addRequestAdditions(nextHandler(app)),
  });

  server.route({
    method: 'GET',
    path: '/_next/{p*}',
    handler: nextDefaultHandler(app),
  });

  server.route({
    method: 'GET',
    path: '/assets/{path*}',
    handler: (request, reply) => {
      if (!request.params.path || request.params.path.indexOf('..') !== -1) {
        return reply(Boom.forbidden());
      }

      const p = Path.join(
        'static',
        'assets',
        ...request.params.path.split('/')
      );
      return reply
        .file(p)
        .header('Cache-Control', 'public, max-age=3600, s-maxage=600');
    },
  });

  return {
    server,
    startup,
  };
}

export default async function startServer(args: ServerArgs) {
  await decryptConfig();

  reportDeployToOpbeat(args.opbeat, process.env.OPBEAT_APP_ID);
  reportDeployToOpbeat(args.opbeat, process.env.OPBEAT_FRONTEND_APP_ID);

  const { server, startup } = makeServer(args);

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
