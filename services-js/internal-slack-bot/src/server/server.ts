/* eslint no-console: 0 */

import * as fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import * as Hapi from 'hapi';
import * as Rollbar from 'rollbar';
import cleanup from 'node-cleanup';

import { WebClient } from '@slack/client';
import { createEventAdapter } from '@slack/events-api';
import { createMessageAdapter } from '@slack/interactive-messages';
import makeWebhookHandler from 'github-webhook-handler';

import decryptEnv from '@cityofboston/srv-decrypt-env';
import {
  loggingPlugin,
  adminOkRoute,
  rollbarPlugin,
  headerKeys,
  HeaderKeysOptions,
} from '@cityofboston/hapi-common';

import {
  DeploymentType,
  DeploymentInteraction,
  DeploymentNotificationPayload,
} from './services/interactions/DeploymentInteraction';

/**
 * Converts an Express handler into options for a Hapi route. Turns off Hapi
 * payload processing and response processing.
 *
 * @param handler Express handler that expects a request and response
 */
function makeExpressAdaptorRoute(
  handler: (req: IncomingMessage, resp: ServerResponse) => void
): Pick<Hapi.ServerRoute, 'handler' | 'options'> {
  return {
    options: {
      // Keep Hapi from changing the POST body
      payload: {
        parse: false,
        output: 'stream',
      },
    },
    handler: (request, h) => {
      const { req, res } = request.raw;
      handler(req, res);
      // The handler will take care of writing to the response.
      return h.abandon;
    },
  };
}

export async function makeServer(port: number, rollbar: Rollbar) {
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

  // Add services to wait for in here.
  // Returns an async shutdown method.
  const startup = async () => {
    await null;

    return async () => {};
  };

  const slackEventAdapter = createEventAdapter(
    process.env.SLACK_SIGNING_SECRET || '',
    { includeBody: true }
  );
  const slackEventHandler = slackEventAdapter.requestListener();

  const slackInteractionAdapter = createMessageAdapter(
    process.env.SLACK_SIGNING_SECRET || ''
  );
  const slackInteractionHandler = slackInteractionAdapter.requestListener();

  const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

  const githubEventHandler = makeWebhookHandler({
    path: '/internal-slack/github',
    secret: process.env.GITHUB_WEBHOOK_SECRET || '',
  });

  const deploymentInteraction = new DeploymentInteraction(
    slackClient,
    process.env.WORKSPACE_CHANNEL_ID_DIGITAL_BUILDS!,
    {
      username: process.env.GITHUB_USERNAME,
      password: process.env.GITHUB_ACCESS_TOKEN,
    }
  );

  await server.register(loggingPlugin);

  await server.register({
    plugin: rollbarPlugin,
    options: { rollbar },
  });

  if (process.env.NODE_ENV === 'production' && !process.env.API_KEYS) {
    throw new Error('Must set $API_KEYS in production');
  }

  server.auth.scheme('headerKeys', headerKeys);
  server.auth.strategy('apiHeaderKeys', 'headerKeys', {
    header: 'X-API-KEY',
    keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  } as HeaderKeysOptions);

  server.route(adminOkRoute);

  // Handles all incoming events from Slack
  server.route({
    method: 'POST',
    path: '/internal-slack/events',
    ...makeExpressAdaptorRoute(slackEventHandler),
  });

  // Handles all interactions from Slack
  server.route({
    method: 'POST',
    path: '/internal-slack/interactions',
    ...makeExpressAdaptorRoute(slackInteractionHandler),
  });

  server.route({
    method: 'POST',
    path: '/internal-slack/github',
    ...makeExpressAdaptorRoute((req, resp) =>
      githubEventHandler(req, resp, err => {
        console.error(err);
        resp.end();
      })
    ),
  });

  server.route({
    method: 'POST',
    path: '/internal-slack/deploy',
    options: {
      auth: 'apiHeaderKeys',
    },
    handler: async ({ payload }) => {
      await deploymentInteraction.handleDeploymentNotification(
        payload as DeploymentNotificationPayload
      );
      return 'ok';
    },
  });

  if (process.env.NODE_ENV === 'development') {
    slackEventAdapter.on('message', message => {
      // we only want to respond to messages from users, not bots
      const isBotMessage =
        message.subtype === 'bot_message' ||
        (message.message && message.message.subtype === 'bot_message');
      const deploymentType: DeploymentType = 'staging';

      if (!isBotMessage) {
        deploymentInteraction.handleDeploymentNotification({
          environment: deploymentType,
          service: 'chat-message@dev',
          commit: 'c0d753e5bb4428cf69770b59c1281fca88e96e5b',
        });
      }
    });
  }

  // handle the user’s approval/rejection:
  slackInteractionAdapter.action('approve_deployment', (payload, respond) =>
    deploymentInteraction.handleApproveInteraction(payload, respond)
  );

  // Listens to GitHub "push" events for changes to staging branches.
  githubEventHandler.on('push', ({ payload }) => {
    const ref: string = payload.ref;
    const commit: string = payload.after;

    const refStagingMatch = ref.match(/^refs\/heads\/staging\/(.*)$/);

    if (refStagingMatch) {
      deploymentInteraction.handleDeploymentNotification({
        environment: 'staging',
        commit,
        service: refStagingMatch[1],
      });
    }
  });

  return { server, startup };
}

export default async function startServer(port: number, rollbar: Rollbar) {
  await decryptEnv();

  const { server, startup } = await makeServer(port, rollbar);
  const shutdown = await startup();

  cleanup(exitCode => {
    shutdown().then(
      () => {
        process.exit(exitCode);
      },
      err => {
        rollbar.error(err);
        console.error('CLEAN EXIT FAILED', err);
        process.exit(-1);
      }
    );

    cleanup.uninstall();
    return false;
  });

  await server.start();

  console.log(`🤖 Slackbot server ready on port ${port}`);
}
