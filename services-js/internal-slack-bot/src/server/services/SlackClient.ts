/* eslint no-console: 0 */

import { WebClient } from '@slack/client';
import {
  deploymentApprovalInitialMessage,
  deploymentCompletionMessage,
} from './messages/deploymentMessages';
import { DeploymentType } from './interactions/deploymentInteractions';

export default class SlackClient {
  public client: any;

  constructor() {
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  public requestDeploymentApproval(deploymentType: DeploymentType) {
    this.client.chat
      .postMessage({
        channel: process.env.WORKSPACE_CHANNEL_ID_DIGITAL_BUILDS,
        ...deploymentApprovalInitialMessage(deploymentType),
      })
      .catch(console.error);
  }

  public listAllChannels() {
    this.client.channels.list().then(channels => channels);
  }

  public notifyDeploymentCompletion(isSuccess: boolean) {
    this.client.chat
      .postMessage({
        channel: process.env.WORKSPACE_CHANNEL_ID_DIGITAL_BUILDS,
        ...deploymentCompletionMessage(isSuccess),
      })
      .catch(console.error);
  }
}
