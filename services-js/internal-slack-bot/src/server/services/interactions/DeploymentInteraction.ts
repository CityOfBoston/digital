import {
  WebClient,
  ChatPostMessageArguments,
  MessageAttachment,
} from '@slack/client';
import { OPTIMISTIC_BLUE, YELLOW, GREEN } from '@cityofboston/react-fleet';
import LRU from 'lru-cache';

export type DeploymentType = 'production' | 'staging';

/**
 * This matches the POST in deploy-tools’ report-updated-services.sh
 */
export interface DeploymentNotificationPayload {
  /** "production" or "staging" */
  environment: string;
  /** Lerna service we’re deploying. */
  service: string | string[];
  commit: string;
}

interface InteractiveMessagePayload {
  type: 'interactive_message';
  actions: [
    {
      name: string;
      type: 'button';
      value: string;
    }
  ];
  callback_id: string;
  team: { id: string; domain: string };
  channel: { id: string; name: string };
  user: { id: string; name: string };
  action_ts: string;
  message_ts: string;
  attachment_id: string;
  token: string;
  is_app_unfurl: boolean;
  original_message: {
    text: string;
    username: string;
    bot_id: string;
    attachments: Object[];
    type: 'message';
    subtype: 'bot_message';
    ts: string;
  };
  response_url: string;
  trigger_id: string;
}

type ServiceDeployStatus =
  | 'REQUESTING'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'ERROR'
  | 'IGNORED'
  | 'OUTOFDATE';

type ServiceDeployRecord = {
  name: string;
  status: ServiceDeployStatus;
  timestamp: number | null;
  userId: string | null;
  errorMessage: string | null;
};

type DeployRecord = {
  environment: DeploymentType;
  commit: string;
  services: { [service: string]: ServiceDeployRecord };
};

type MessageBody = Pick<
  ChatPostMessageArguments,
  Exclude<keyof ChatPostMessageArguments, 'channel'>
>;

export class DeploymentInteraction {
  private slackClient: WebClient;
  private deployChannelId: string;

  /** The latest commit we’ve seen for each service, to prevent stomping. */
  private commitsByService: { [service: string]: string } = {};
  /** Key is the timestamp of the original message. */
  private deploysByTimestamp = LRU<string, DeployRecord>(100);

  constructor(slackClient: WebClient, deployChannelId: string) {
    this.slackClient = slackClient;
    this.deployChannelId = deployChannelId;
  }

  async handleDeploymentNotification({
    environment,
    commit,
    service,
  }: DeploymentNotificationPayload) {
    if (environment !== 'production') {
      throw new Error(`Unknown deployment environment: ${environment}`);
    }

    const services = ([] as string[]).concat(service);
    const serviceRecords: DeployRecord['services'] = {};

    services.forEach(s => {
      this.commitsByService[s] = commit;
      serviceRecords[s] = {
        name: s,
        status: 'REQUESTING',
        userId: null, //'UDWA2N6AD',
        timestamp: null,
        errorMessage: null,
      };
    });

    const deployRecord = {
      environment: environment as DeploymentType,
      commit,
      services: serviceRecords,
    };

    const postResponse = await this.slackClient.chat.postMessage({
      channel: this.deployChannelId,
      response_type: 'in_channel',
      ...this.makeDeploymentMessage(deployRecord),
    });

    if (!postResponse.ok) {
      throw new Error(`Post to Slack failed for ${commit}`);
    }

    // Message response looks like this. The TypeScript type doesn’t have the
    // "ts" property, so we need to cast to any to get at it.
    //
    // {
    //   ok: true,
    //   channel: 'CDUJJEHU2',
    //   ts: '1541623587.001300',
    //   message: {
    //     text: '',
    //     username: 'Fin Test Bot',
    //     bot_id: 'BDWHM7MC0',
    //     attachments: [[Object], [Object]],
    //     type: 'message',
    //     subtype: 'bot_message',
    //     ts: '1541623587.001300',
    //   },
    //   scopes: ['identify', 'bot:basic'],
    //   acceptedScopes: ['chat:write:bot', 'post'],
    // };
    this.deploysByTimestamp.set((postResponse as any).ts, deployRecord);
  }

  protected urlForCommit(commit: string): string {
    return `https://github.com/CityOfBoston/digital/commit/${commit}`;
  }

  protected makeDeploymentMessage(deploy: DeployRecord): MessageBody {
    const { commit, services } = deploy;

    const commitUrl = this.urlForCommit(commit);
    const text = `🚢 A ${
      deploy.environment
    } change [<${commitUrl}|${commit.substring(
      0,
      8
    )}>] is ready. Let’s get it shipped!`;

    return {
      // Unfortunately using text means we get little remove xs by the
      // attachments, but switching to "pretext" in an attachment prevents link
      // unfurling from working.
      text,
      unfurl_links: true,
      username: 'Shippy-Toe',
      icon_url:
        'https://avatars.slack-edge.com/2017-10-25/261992224516_aad5aecf95aedd33f079_48.png',
      attachments: Object.values(services).map(service =>
        this.makeServiceAttachment(commit, service)
      ),
    };
  }

  protected makeServiceAttachment(
    commit: string,
    service: ServiceDeployRecord
  ): MessageAttachment {
    const status: ServiceDeployStatus =
      commit === this.commitsByService[service.name]
        ? service.status
        : 'OUTOFDATE';

    switch (status) {
      case 'REQUESTING':
        return {
          title: service.name,
          color: OPTIMISTIC_BLUE,
          callback_id: 'approve_deployment',
          actions: [
            {
              name: service.name,
              text: 'Deploy',
              value: 'approve',
              type: 'button',
              style: 'primary',
            },
            {
              name: service.name,
              text: 'Ignore',
              value: 'ignore',
              type: 'button',
            },
          ],
        };
      case 'IGNORED':
        return {
          title: service.name,
          text: `👎 _This change was ignored by <@${service.userId}>._`,
        };

      case 'DEPLOYING':
        return {
          title: service.name,
          color: YELLOW,
          text: `🔜 _Deploy requested by <@${service.userId}>…_`,
          // The TypeScript definition wants a string but a number is fine.
          ts: service.timestamp as any,
        };

      case 'DEPLOYED':
        return {
          title: service.name,
          color: GREEN,
          text: `💥 _Deploy complete!_`,
          // The TypeScript definition wants a string but a number is fine.
          ts: service.timestamp as any,
        };

      case 'OUTOFDATE':
        return {
          title: service.name,
          text: '🕰 _There’s a newer version of this service to deploy._',
        };

      default:
        return {};
    }
  }

  handleApproveInteraction(
    payload: InteractiveMessagePayload,
    respond: (message: MessageBody) => void
  ) {
    const deploy = this.deploysByTimestamp.get(payload.message_ts);

    if (!deploy) {
      return {
        text: '_Unfortunately I can’t deploy that release anymore._',
      };
    }

    const action = payload.actions[0];

    const service = deploy.services[action.name];
    if (!service) {
      // eslint-disable-next-line no-console
      console.warn(`Service ${action.name} not found in deploy`, deploy);
      return;
    }

    // TODO(finh): Keep approved list of users who may do this
    service.userId = payload.user.id;
    service.timestamp = Date.now() / 1000;

    if (this.commitsByService[service.name] !== deploy.commit) {
      service.status = 'OUTOFDATE';
    } else if (action.value === 'ignore') {
      service.status = 'IGNORED';
    } else if (action.value === 'approve') {
      service.status = 'DEPLOYING';
      setTimeout(() => {
        service.status = 'DEPLOYED';
        service.timestamp = Date.now() / 1000;
        respond(this.makeDeploymentMessage(deploy));
      }, 2000);
    }

    this.deploysByTimestamp.set(payload.message_ts, deploy);
    return this.makeDeploymentMessage(deploy);
  }
}
