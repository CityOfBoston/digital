/* eslint no-console: 0 */

import * as fs from 'fs';
import * as Hapi from 'hapi';
import * as Rollbar from 'rollbar';
import cleanup from 'node-cleanup';

import { WebClient } from '@slack/client';
import { createEventAdapter } from '@slack/events-api';
import { createMessageAdapter } from '@slack/interactive-messages';

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

  const deploymentInteraction = new DeploymentInteraction(
    slackClient,
    process.env.WORKSPACE_CHANNEL_ID_DIGITAL_BUILDS!
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
    options: {
      // slackEventHandler will manage the payload; pass it along as-is
      payload: {
        parse: false,
        output: 'stream',
      },
    },
    handler: (request, h) => {
      const { req, res } = request.raw;

      // slackEventHandler will take over from here
      slackEventHandler(req, res);

      // hapi should not handle the response
      return h.abandon;
    },
  });

  // Handles all interactions from Slack
  server.route({
    method: 'POST',
    path: '/internal-slack/interactions',
    options: {
      // slackInteractionHandler will manage the payload; pass it along as-is
      payload: {
        parse: false,
        output: 'stream',
      },
    },
    handler: (request, h) => {
      const { req, res } = request.raw;

      // slackInteractionHandler will take over from here
      slackInteractionHandler(req, res);

      // hapi should not handle the response
      return h.abandon;
    },
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

  // todo: temporary: approve/reject approval request will be triggered by a webhook, not a direct message
  slackEventAdapter.on('message', message => {
    // we only want to respond to messages from users, not bots
    const isBotMessage =
      message.subtype === 'bot_message' ||
      (message.message && message.message.subtype === 'bot_message');
    const deploymentType: DeploymentType = 'production';

    if (!isBotMessage) {
      deploymentInteraction.handleDeploymentNotification({
        environment: deploymentType,
        service: 'chat-message',
        commit: 'c0d753e5bb4428cf69770b59c1281fca88e96e5b',
      });
    }
  });

  // handle the user’s approval/rejection:
  slackInteractionAdapter.action('approve_deployment', (payload, respond) =>
    deploymentInteraction.handleApproveInteraction(payload, respond)
  );

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
