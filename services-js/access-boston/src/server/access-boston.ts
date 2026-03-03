/* eslint no-console: 0 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import fetch from 'node-fetch';
import Boom from 'boom';
// import { fetch as crossFetch } from 'cross-fetch';

import { Server as HapiServer, ResponseObject, Lifecycle } from 'hapi';
import Inert from 'inert';
import Crumb from 'crumb';
import yar from 'yar';
import cleanup from 'node-cleanup';
import acceptLanguagePlugin from 'hapi-accept-language2';
import hapiDevErrors from 'hapi-dev-errors';
import next from 'next';
import { ApolloServer } from 'apollo-server-hapi';

import { parse, Compile } from 'velocityjs';
import { default as pingData } from './ping-templates/mockData';
import { serverPayloadValidAndUseful } from './helpers';

import Rollbar from 'rollbar';

import {
  API_KEY_CONFIG_KEY,
  GRAPHQL_PATH_KEY,
  HAPI_INJECT_CONFIG_KEY,
  GOOGLE_TRACKING_ID_KEY,
} from '@cityofboston/next-client-common';

import {
  loggingPlugin,
  makeStaticAssetRoutes,
  adminOkRoute,
  headerKeysPlugin,
  browserAuthPlugin,
  rollbarPlugin,
  HapiGraphqlContextFunction,
  rollbarErrorExtension,
} from '@cityofboston/hapi-common';

import { makeRoutesForNextApp, makeNextHandler } from '@cityofboston/hapi-next';

import decryptEnv from '@cityofboston/srv-decrypt-env';

import graphqlSchema, { Context } from './graphql/schema';

// IdentityIQ has been deprecated in favor of COBRA for all operations
import CobraClient from './services/cobra/CobraClient';
import AppsRegistry, { makeAppsRegistry } from '../lib/AppsRegistry';

import { addLoginAuth } from './login-auth';
import { addForgotPasswordAuth } from './forgot-password-auth';
import Session from './Session';
import PingId, { pingIdFromProperties } from './services/PingId';
import PingIdFake from './services/PingIdFake';

import {
  allowPreferredNameEndpointReq,
} from './services/preferredName';

import CreateUniqueEmail from './services/cobra/CreateUniqueEmail';
import { PreferredNameService } from './services/cobra/PreferredName';

require('dotenv').config();

interface ID_VERIFICATION {
  method: string;
  protocol: string;
  baseurl: string;
  port: string;
  path: string;
  filter: string;
  username: string;
  pwd: string;
  auth: string;
  cookie?: string;
}

const readFile = promisify(fs.readFile);

const PATH_PREFIX = '';
const FORGOT_PASSWORD_PATH = '/forgot';

const PINGID_PROPERTIES_FILE = 'pingid.properties';

const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.HAPI_REDIS_CACHE_HOST
) {
  throw new Error('$HAPI_REDIS_CACHE_HOST is not defined');
}

export async function makeServer(port, rollbar: Rollbar) {
  const serverOptions = {
    host: '0.0.0.0',
    port,
    tls: undefined as any,
    state: {
      ignoreErrors: true,
    },
    cache: process.env.HAPI_REDIS_CACHE_HOST
      ? {
          engine: require('catbox-redis'),
          host: process.env.HAPI_REDIS_CACHE_HOST,
          port: parseInt(process.env.HAPI_REDIS_CACHE_PORT || '6379'),
          database: parseInt(process.env.HAPI_REDIS_CACHE_DATABASE || '0'),
          partition: `${process.env.DEPLOY_VARIANT}-`,
        }
      : undefined,

    // debug:
    //   // eslint-disable-next-line
    //   dev || true
    //     ? {
    //         request: ['error'],
    //       }
    //     : {},
  };

  if (process.env.USE_SSL) {
    serverOptions.tls = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
    };
  }

  const server = new HapiServer(serverOptions);

  const appsRegistry = await (process.env.NODE_ENV === 'production' ||
  (dev && fs.existsSync('./apps.yaml'))
    ? makeAppsRegistry(await readFile('./apps.yaml', 'utf-8'))
    : makeAppsRegistry(
        await readFile(
          path.resolve(__dirname, '../../fixtures/apps.yaml'),
          'utf-8'
        ),
        process.env.NODE_ENV !== 'test'
      ));
  const pingId: PingId =
    process.env.NODE_ENV === 'production' ||
    (dev && fs.existsSync(PINGID_PROPERTIES_FILE))
      ? await pingIdFromProperties(PINGID_PROPERTIES_FILE)
      : (new PingIdFake() as any);

  await server.register(acceptLanguagePlugin);
  await server.register(Inert);
  await server.register(Crumb);
  await server.register({ plugin: rollbarPlugin, options: { rollbar } });

  await server.register({
    plugin: hapiDevErrors,
    options: {
      // AWS_S3_CONFIG_URL is a hack to see if we’re running in staging, since
      // we don’t expose that as an env variable otherwise.
      showErrors:
        dev ||
        (process.env.NODE_ENV === 'production' &&
          (process.env.AWS_S3_CONFIG_URL || '').includes('staging')),
    },
  });

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.SESSION_COOKIE_PASSWORD
  ) {
    throw new Error('Must set $SESSION_COOKIE_PASSWORD in production');
  }

  await server.register({
    plugin: yar,
    options: {
      // Always stores everything in the cache, so we can clear out sessions
      // unilaterally rather than relying on cookie expiration and being
      // vulnerable to replays.
      maxCookieSize: 0,
      cookieOptions: {
        password:
          process.env.SESSION_COOKIE_PASSWORD ||
          'test-fake-key-iWIMwE69HJj9GQcHfCiu2TVyZoVxvYoU',
        isSecure: process.env.NODE_ENV === 'production',
        isHttpOnly: true,
        // If we happen to get POSTed to from the SAML provider we still want to
        // have our session available.
        isSameSite: false,
        // Timeout after 15 mins of inactivity; corresponds to Ping Federate
        // Session configuration
        ttl: 15 * 60 * 1000,
      },
    },
  });

  await server.register(browserAuthPlugin);

  await addLoginAuth(server, rollbar, {
    loginPath: '/login',
    logoutPath: '/logout',
    afterLoginUrl: '/',
  });

  await addForgotPasswordAuth(server, {
    forgotPath: FORGOT_PASSWORD_PATH,
  });

  // If the server is running in test mode we don't want the logs to pollute the
  // Jests output.
  if (process.env.NODE_ENV !== 'test') {
    await server.register(loggingPlugin);
  }

  server.route(adminOkRoute);
  server.route(makeStaticAssetRoutes());

  const cobraClient = new CobraClient();
  await addGraphQl(server, appsRegistry, pingId, cobraClient, rollbar);

  await addVelocityTemplates(server, cobraClient);

  // We don't turn on Next for test mode because it hangs Jest.
  if (process.env.NODE_ENV !== 'test') {
    await addNext(server);
  }

  return {
    server,
    startup: async () => {
      await server.start();

      console.log(
        `> Ready on http${
          process.env.USE_SSL ? 's' : ''
        }://localhost:${port}${PATH_PREFIX}`
      );

      // Add more shutdown code here.
      return () => Promise.all([server.stop()]);
    },
  };
}

async function addGraphQl(
  server: HapiServer,
  appsRegistry: AppsRegistry,
  pingId: PingId,
  cobraClient: CobraClient,
  rollbar: Rollbar
) {
  if (process.env.NODE_ENV === 'production' && !process.env.API_KEYS) {
    throw new Error('Must set $API_KEYS in production');
  }

  await server.register({
    plugin: headerKeysPlugin,
    options: {
      header: 'X-API-KEY',
      keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
    },
  });

  const context: HapiGraphqlContextFunction<Context> = ({ request }) => ({
    session: new Session(request),
    appsRegistry,
    pingId,
    cobraClient,
  });

  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context,
    formatError: () => {
      return {
        message: 'Internal Server Error',
        locations: [],
        path: [],
        extensions: {},
      };
    },
    extensions: [rollbarErrorExtension(rollbar)],
  });

  await apolloServer.applyMiddleware({
    app: server,
    route: {
      auth: {
        // It’s the resolvers’ responsibility to throw Forbidden exceptions if
        // they’re trying to do something that needs authorization but it’s
        // not there.
        //
        // Since this is an API, it’s fine to send a Forbidden response,
        // there’s no need to 300 to a login page.
        mode: 'optional',
        strategies: ['login', 'forgot-password'],
      },
      plugins: {
        // We auth with a header, which can't be set via CSRF, so it's safe to
        // avoid checking the crumb cookie.
        crumb: false,
        headerKeys: !!process.env.API_KEYS,
      },
    },
  });
}

async function addVelocityTemplates(server: HapiServer, cobraClient: CobraClient) {
  server.route({
    path: '/ping/login',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/html.form.login.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/ping/logout',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/idp.logout.success.page.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/ping/change-password',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/html.form.change.password.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/ping/general-error',
    method: 'GET',
    options: {
      auth: false,
    },
    handler: () => {
      const template = fs.readFileSync(
        './src/server/ping-templates/general.error.page.template.html',
        'utf-8'
      );
      const asts = parse(template);

      return new Compile(asts, { escape: false }).render(pingData);
    },
  });

  server.route({
    path: '/id-verification',
    method: ['GET'],
    options: {
      auth: false,
      plugins: {
        crumb: false,
      },
      timeout: { server: 15000 },
    },
    handler: async req => {
      if (req.query['id']) {
        const idver: ID_VERIFICATION = {
          method: process.env.ID_VERIFICATION_HTTP_METHOD as string,
          protocol: process.env.ID_VERIFICATION_PROTOCOL as string,
          baseurl: process.env.ID_VERIFICATION_BASEURL as string,
          port: process.env.ID_VERIFICATION_PORT as string,
          path: process.env.ID_VERIFICATION_PATH as string,
          filter: process.env.ID_VERIFICATION_FILTER as string,
          username: process.env.ID_VERIFICATION_USERNAME as string,
          pwd: process.env.ID_VERIFICATION_PWD as string,
          auth: process.env.ID_VERIFICATION_AUTH as string,
          cookie: process.env.ID_VERIFICATION_COOKIE
            ? (process.env.ID_VERIFICATION_COOKIE as string)
            : ('' as string),
        };
        const endpoint = `${idver.protocol}${idver.baseurl}:${idver.port}${
          idver.path
        }${idver.filter}"${req.query['id']}"` as string;

        const fetchQ = async () => {
          return await fetch(endpoint, {
            method: idver.method,
            redirect: 'follow',
            headers: {
              Authorization: idver.auth,
              // Cookie: idver.cookie,
            },
          })
            .then(response => response.json())
            .catch(error =>
              console.log('/id-verification endpoint Error:', error)
            );
        };
        const respObj: any = await fetchQ();

        if (!respObj) {
          throw Boom.notFound(`No data is available for »${req.query['id']}«`);
        }

        return respObj;
      } else {
        throw Boom.notFound(`No data is available for »${req.query['id']}«`);
      }
    },
  });

  server.route({
    path: '/preferred-name-request',
    method: ['POST'],
    options: {
      auth: false,
      plugins: {
        crumb: false,
      },
      timeout: { server: 15000 },
    },
    handler: async (req, h) => {
      // Only allow request where headers['token'] or referrer ~ host
      if (
        allowPreferredNameEndpointReq(req, process.env.PREFERRED_NAME__API_KEY)
      ) {
        const reqReqFields = ['id'];
        const optFields = ['preferredFirstName', 'preferredLastName'];
        const validRequestFields = reqReqFields.concat(optFields);
        const serverPayloadValid = serverPayloadValidAndUseful(
          req.payload,
          validRequestFields,
          1,
          optFields
        );

        try {
          if (
            typeof req.payload === 'object' &&
            req.payload &&
            serverPayloadValid
          ) {
            if (dev) {
              // USE FIXTURE
              return await readFile(
                path.resolve(
                  __dirname,
                  '../../fixtures/preferred-chosen-name/test/COB-Workflow-GenerateUniqueEmail/response/40000093.json'
                ),
                'utf-8'
              );
            } else {
              // COBRA: Generate unique email using CreateUniqueEmail service
              const createUniqueEmailService = new CreateUniqueEmail(cobraClient);
              
              // Get user ID and names (trim whitespace)
              const userId = req.payload['id'] || '';
              const firstName = (req.payload['preferredFirstName'] || '').trim();
              const lastName = (req.payload['preferredLastName'] || '').trim();
              
              if (!userId) {
                return h
                  .response({
                    error: 'Missing required field: id (userId)',
                  })
                  .code(400);
              }
              
              if (!firstName || !lastName) {
                return h
                  .response({
                    error: 'Missing required fields: preferredFirstName and preferredLastName',
                  })
                  .code(400);
              }

              console.log('[preferred-name-request] Generating unique email for:', firstName, lastName, 'userId:', userId);
              
              try {
                const emailResult = await createUniqueEmailService.process({
                  userId,
                  firstName,
                  lastName
                });

                console.log('[preferred-name-request] Email result:', emailResult);
                
                // Return response matching IdentityIQ format
                return {
                  status: null,
                  requestID: Math.random().toString(36).substring(2),
                  warnings: null,
                  errors: emailResult.available ? null : [emailResult.message],
                  retryWait: 0,
                  metaData: null,
                  attributes: {
                    result: {
                      DisplayName: `${firstName} ${lastName}`,
                      newEmail: emailResult.email || '',
                      error: emailResult.available ? '' : (emailResult.message || 'Failed to generate email'),
                    },
                  },
                  retry: false,
                  failure: !emailResult.available,
                  complete: true,
                  success: emailResult.available,
                };
              } catch (error) {
                console.error('[preferred-name-request] Error generating email:', error);
                // On error, return success with error message as the email
                // This allows the flow to continue with the error shown in place of email
                return {
                  status: null,
                  requestID: Math.random().toString(36).substring(2),
                  warnings: null,
                  errors: null,
                  retryWait: 0,
                  metaData: null,
                  attributes: {
                    result: {
                      DisplayName: `${firstName} ${lastName}`,
                      newEmail: error instanceof Error ? error.message : 'Error generating email',
                      error: error instanceof Error ? error.message : 'Failed to generate email',
                    },
                  },
                  retry: false,
                  failure: false, // Don't fail - show error in email field
                  complete: true,
                  success: true, // Continue flow even on error
                };
              }
            }
          } else {
            throw Boom.notFound(`No data is available for »${req}«`);
          }
        } catch (error) {
          console.error('[preferred-name-request] Error:', error);
          return h
            .response({
              error: 'Invalid request format (JSON); Check fields / values.',
              message: error instanceof Error ? error.message : 'Unknown error',
            })
            .code(400);
        }
      } else {
        return h
          .response({ error: 'Invalid or Missing Token or referrer != host' })
          .code(400);
      }
    },
  });

  server.route({
    path: '/preferred-name-submit',
    method: ['POST'],
    options: {
      auth: false,
      plugins: {
        crumb: false,
      },
      timeout: { server: 60000 },
    },
    handler: async (req, h) => {
      // Only allow request where headers['token'] or referrer ~ host
      if (
        allowPreferredNameEndpointReq(req, process.env.PREFERRED_NAME__API_KEY)
      ) {
        const reqReqFields = ['id', 'email'];
        const optFields = ['preferredFirstName', 'preferredLastName'];
        const validRequestFields = reqReqFields.concat(optFields);
        const serverPayloadValid = serverPayloadValidAndUseful(
          req.payload,
          validRequestFields,
          1,
          optFields
        );

        try {
          if (
            typeof req.payload === 'object' &&
            req.payload &&
            serverPayloadValid
          ) {
            if (dev) {
              // USE FIXTURE
              return await readFile(
                path.resolve(
                  __dirname,
                  '../../fixtures/preferred-chosen-name/test/COB-Workflow-PreferredNames/response/40000093.json'
                ),
                'utf-8'
              );
            } else {
              // COBRA: Update preferred name using PreferredNameService
              const preferredNameService = new PreferredNameService(cobraClient);
              
              const userId = req.payload['id'];
              const firstName = (req.payload['preferredFirstName'] || '').trim();
              const lastName = (req.payload['preferredLastName'] || '').trim();
              const email = req.payload['email'] ? req.payload['email'].trim() : undefined;

              console.log('[preferred-name-submit] Updating preferred name for user:', userId);
              console.log('[preferred-name-submit] Name:', firstName, lastName);
              console.log('[preferred-name-submit] Email:', email || '(not changing)');

              const result = await preferredNameService.changePreferredName(
                userId,
                firstName,
                lastName,
                email
              );

              // Check if it's an error response
              if ('error' in result) {
                console.error('[preferred-name-submit] Error from COBRA:', result);
                return h
                  .response({
                    status: null,
                    requestID: null,
                    warnings: null,
                    errors: [result.message],
                    retryWait: 0,
                    metaData: null,
                    attributes: {
                      status: `Error: ${result.message}`,
                    },
                    retry: false,
                    failure: true,
                    complete: true,
                    success: false,
                  })
                  .code(400);
              }

              // Return success response matching IdentityIQ format
              console.log('[preferred-name-submit] Success:', result.message);
              return {
                status: null,
                requestID: result.requestId,
                warnings: null,
                errors: null,
                retryWait: 0,
                metaData: null,
                attributes: {
                  status: 'Success. Updated Attributes in IIQ',
                },
                retry: false,
                failure: false,
                complete: true,
                success: true,
              };
            }
          } else {
            throw Boom.notFound(`No data is available for »${req}«`);
          }
        } catch (error) {
          console.error('[preferred-name-submit] Error:', error);
          return h
            .response({
              error: 'Invalid request format (JSON); Check fields / values.',
              message: error instanceof Error ? error.message : 'Unknown error',
            })
            .code(400);
        }
      } else {
        return h
          .response({ error: 'Invalid or Missing Token or referrer != host' })
          .code(400);
      }
    },
  });

  server.route({
    path: '/fetchGraphql',
    method: ['POST'],
    options: {
      auth: false,
      plugins: {
        crumb: false,
      },
      timeout: { server: 15000 },
    },
    handler: async _req => {
      const fetchQ = async this_req => {
        const query = this_req.payload.query;
        const variables = this_req.payload.variables;

        return await fetch(
          `${process.env.GROUP_MANAGEMENT_API_URL}` as string,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              token: `${process.env.GROUP_MGMT_API_KEY}` as string,
            },
            body: JSON.stringify({
              query,
              variables,
            }),
          }
        )
          .then(response => response.json())
          .then(response => response);
      };

      return await fetchQ(_req);
    },
  });
}

async function addNext(server: HapiServer) {
  // We load the config ourselves so that we can modify the runtime configs
  // from here.
  const config = require('../../next.config.js');

  const externalAssetUrl = process.env.ASSET_HOST
    ? `https://${process.env.ASSET_HOST}/access-boston`
    : undefined;

  config.publicRuntimeConfig = {
    ...config.publicRuntimeConfig,
    [GRAPHQL_PATH_KEY]: '/graphql',
    [API_KEY_CONFIG_KEY]: process.env.WEB_API_KEY,
    [GOOGLE_TRACKING_ID_KEY]: process.env.GOOGLE_TRACKING_ID,
    PING_HOST: process.env.PING_HOST,
  };

  config.serverRuntimeConfig = {
    [HAPI_INJECT_CONFIG_KEY]: server.inject.bind(server),
    ...config.serverRuntimeConfig,
  };

  const nextApp = next({
    dev,
    dir: 'src',
    conf: config,
  });

  // We have to manually add the CSRF token because the Next helpers
  // only work on raw http objects and don't write out Hapi’s "state"
  // cookies.
  const addCrumbCookie: Lifecycle.Method = (request, h) => {
    if (!request.state['crumb']) {
      const crumb = (server.plugins as any).crumb.generate(request, h);
      request.raw.res.setHeader('Set-Cookie', `crumb=${crumb};HttpOnly`);
    }

    return h.continue;
  };

  // Hapi’s default caching handling doesn’t support things like "no-store,"
  // which we want to ensure so that Firefox’s back/forward cache doesn’t
  // keep the page around after logout. (So you can’t "back" in to a logged-
  // in looking portal page after the session has expired.)
  const noCaching: Lifecycle.Method = (request, h) => {
    const response: ResponseObject | null = request.response as any;
    if (response && response.header) {
      response.header('cache-control', 'no-cache,no-store,max-age=0');
    }
    return h.continue;
  };

  // We have a special Next handler for the /forgot route that uses the
  // "forgot-password" session auth rather than the default "login".
  server.route({
    method: ['GET', 'POST'],
    path: FORGOT_PASSWORD_PATH,
    options: {
      auth: 'forgot-password',
      ext: {
        onPostAuth: {
          method: addCrumbCookie,
        },
        onPreResponse: {
          method: noCaching,
        },
      },
    },
    handler: makeNextHandler(nextApp),
  });

  // The /done route is special because that's where we send people after
  // they're done filling out their registration. It needs to clear the local
  // session so that the user is prompted to log in again.
  //
  // (The user is logged out of SAML during registration, we only have the local
  // session.)
  server.route({
    method: ['POST'],
    path: '/done',
    options: {
      ext: {
        onPostAuth: {
          method: addCrumbCookie,
        },
        onPreResponse: {
          method: noCaching,
        },
      },
    },
    handler: (nextHandler => (request, h) => {
      // eslint-disable-next-line no-console
      console.log('[DONE] User arrived at /done, clearing session to force re-login');
      
      request.yar.reset();

      return nextHandler(request, h);
    })(makeNextHandler(nextApp)),
  });

  server.route({
    method: ['GET'],
    path: '/warptime',
    handler: () => {
      return `${process.env.GROUP_MANAGEMENT_API_URL}`;
    },
    options: {
      // mark this as a health check so that it doesn’t get logged
      tags: ['health'],
      auth: false,
    },
  });

  server.route(
    makeRoutesForNextApp(
      nextApp,
      '/',
      {
        ext: {
          onPostAuth: {
            method: addCrumbCookie,
          },
          onPreResponse: {
            method: noCaching,
          },
        },
      },
      {
        // Keeps us from doing session stuff on the static routes.
        plugins: { yar: { skip: true } },
      },
      externalAssetUrl
    )
  );

  await nextApp.prepare();
}

export default async function startServer(rollbar: Rollbar) {
  await decryptEnv();

  const port = parseInt(process.env.PORT || '3000', 10);

  const { startup } = await makeServer(port, rollbar);
  const shutdown = await startup();

  // tsc-watch sends SIGUSR2 when it’s time to restart. That’s not caught by
  // cleanup, so we get it ourselves so we can do a clean shutdown.
  process.on('SIGUSR2', () => {
    // Keeps us alive
    process.stdin.resume();

    // This will cause cleanup to run below
    process.kill(process.pid, 'SIGINT');
  });

  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode);
      },
      err => {
        rollbar.error(err);
        console.log('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });
}
