/* eslint no-console: 0 */

import * as fs from 'fs';
import * as Hapi from 'hapi';
import * as Rollbar from 'rollbar';
import cleanup from 'node-cleanup';

import { createEventAdapter } from '@slack/events-api';
import { createMessageAdapter } from '@slack/interactive-messages';

import decryptEnv from '@cityofboston/srv-decrypt-env';
import {
  loggingPlugin,
  adminOkRoute,
  rollbarPlugin,
} from '@cityofboston/hapi-common';

import SlackClient from './services/SlackClient';

import {
  deploymentApprovalInteraction,
  DeploymentType,
} from './services/interactions/deploymentInteractions';

export async function makeServer(port: number, rollbar: Rollbar) {
  const serverOptions = {
    port,
    host: 'localhost',
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
  const slackClient = new SlackClient();

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

  await server.register(loggingPlugin);

  await server.register({
    plugin: rollbarPlugin,
    options: { rollbar },
  });

  server.route(adminOkRoute);

  server.route({
    method: 'GET',
    path: '/',
    handler: () => {
      return 'I am a bot.';
    },
  });

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
    handler: (request: Hapi.Request, h) => {
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
    handler: (request: Hapi.Request, h) => {
      const { req, res } = request.raw;

      // slackInteractionHandler will take over from here
      slackInteractionHandler(req, res);

      // hapi should not handle the response
      return h.abandon;
    },
  });

  // todo: incoming messages from build
  server.route({
    method: 'POST',
    path: '/codebuild',
    // @ts-ignore
    handler: (request: Hapi.Request, h) => {
      // const isSuccess = request.raw;
      const isSuccess = true;

      // if (request === 'authorize') {
      //   slackClient.requestDeploymentApproval(deploymentType);
      // } else if (request === 'complete' {

      slackClient.notifyDeploymentCompletion(isSuccess);
      // }

      return h.abandon;
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
      slackClient.requestDeploymentApproval(deploymentType);
    }
  });

  // handle the user’s approval/rejection:
  slackInteractionAdapter.action(
    'approve_deployment',
    deploymentApprovalInteraction
  );

  return { server, startup };
}

export default async function startServer(port: number, rollbar: Rollbar) {
  const { server, startup } = await makeServer(port, rollbar);
  const shutdown = await startup();

  await decryptEnv();

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
