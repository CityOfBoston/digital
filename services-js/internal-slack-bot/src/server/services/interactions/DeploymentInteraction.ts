import LRU from 'lru-cache';
import { CodeBuild } from 'aws-sdk';
import fetch from 'node-fetch';

import {
  WebClient,
  ChatPostMessageArguments,
  MessageAttachment,
} from '@slack/client';

export type DeploymentType = 'production' | 'staging';

/**
 * This matches the POST in deploy-tools’ report-updated-services.sh
 */
export interface DeploymentNotificationPayload {
  /** "production" or "staging" */
  environment: string;
  /** Lerna service we’re deploying. */
  service?: string | string[];
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
  | 'FAILED'
  | 'IGNORED'
  | 'OUTOFDATE';

type ServiceDeployRecord = {
  /** includes @variant if it exists */
  fullName: string;
  name: string;
  variant: string | null;
  status: ServiceDeployStatus;
  buildUrl: string | null;
  timestamp: number | null;
  userId: string | null;
  errorMessage: string | null;
};

type DeployRecord = {
  repo: string;
  environment: DeploymentType;
  commit: string;
  services: { [serviceAndVariant: string]: ServiceDeployRecord };
};

type MessageBody = Pick<
  ChatPostMessageArguments,
  Exclude<keyof ChatPostMessageArguments, 'channel'>
>;

export interface GitHubCredentials {
  username: string | undefined;
  password: string | undefined;
}

const DIGITAL_REPO = 'CityOfBoston/digital';
const DIGITAL_REPO_CODEBUILD_PROJECT = 'AppsDigitalDeploy';

const FREEDOM_RED = '#fb4d42';
const GREEN = '#62A744';
const OPTIMISTIC_BLUE = '#288be4';
const YELLOW = '#fcb61a';

export class DeploymentInteraction {
  private slackClient: WebClient;
  private codebuild = new CodeBuild();
  private deployChannelId: string;
  private githubCredentials: GitHubCredentials;

  /**
   * The latest commit we’ve seen for each service, to prevent stomping.
   *
   * Key is the branch name format: environment/service@variant
   */
  private commitsByEnvironmentServiceAndVariant: {
    [service: string]: string;
  } = {};

  /** Key is the timestamp of the original message. */
  private deploysByTimestamp = LRU<string, DeployRecord>(100);

  constructor(
    slackClient: WebClient,
    deployChannelId: string,
    githubCredentials: GitHubCredentials
  ) {
    this.slackClient = slackClient;
    this.deployChannelId = deployChannelId;
    this.githubCredentials = githubCredentials;
  }

  async handleDeploymentNotification({
    environment,
    commit,
    service,
  }: DeploymentNotificationPayload) {
    if (environment !== 'production' && environment !== 'staging') {
      throw new Error(`Unknown deployment environment: ${environment}`);
    }

    // We need to be tolerant of no services changing.
    if (!service) {
      return;
    }

    const services = ([] as string[]).concat(service);
    const serviceRecords: DeployRecord['services'] = {};

    services.forEach(serviceAndVariant => {
      this.commitsByEnvironmentServiceAndVariant[
        `${environment}/${serviceAndVariant}`
      ] = commit;

      serviceRecords[serviceAndVariant] = {
        fullName: serviceAndVariant,
        name: serviceAndVariant.split('@')[0],
        variant: serviceAndVariant.split('@')[1] || null,
        status: 'REQUESTING',
        buildUrl: null,
        userId: null, //'UDWA2N6AD',
        timestamp: null,
        errorMessage: null,
      };
    });

    const deployRecord = {
      environment: environment as DeploymentType,
      commit,
      services: serviceRecords,
      repo: DIGITAL_REPO,
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
        this.makeServiceAttachment(deploy.environment, commit, service)
      ),
    };
  }

  protected makeServiceAttachment(
    environment: string,
    commit: string,
    service: ServiceDeployRecord
  ): MessageAttachment {
    const commitsMatch =
      commit ===
      this.commitsByEnvironmentServiceAndVariant[
        `${environment}/${service.fullName}`
      ];

    const status: ServiceDeployStatus = commitsMatch
      ? service.status
      : 'OUTOFDATE';

    const serviceTitle = `${service.name}${
      service.variant ? ` — ${service.variant}` : ''
    }`;

    switch (status) {
      case 'REQUESTING':
        return {
          title: serviceTitle,
          color: OPTIMISTIC_BLUE,
          callback_id: 'approve_deployment',
          actions: [
            {
              name: service.fullName,
              text: 'Deploy',
              value: 'approve',
              type: 'button',
              style: 'primary',
            },
            {
              name: service.fullName,
              text: 'Ignore',
              value: 'ignore',
              type: 'button',
            },
          ],
        };

      case 'IGNORED':
        return {
          title: serviceTitle,
          text: `👎 _This change was ignored by <@${service.userId}>._`,
        };

      case 'ERROR':
        return {
          title: serviceTitle,
          color: FREEDOM_RED,
          text: `🙀 _${service.errorMessage}_`,
        };

      case 'DEPLOYING':
        return {
          title: serviceTitle,
          color: YELLOW,
          text: `🔜 _Deploy requested by <@${service.userId}>…_${
            service.buildUrl ? ` (<${service.buildUrl}|view on CodeBuild>)` : ''
          }`,
          // The TypeScript definition wants a string but a number is fine.
          ts: service.timestamp as any,
        };

      case 'DEPLOYED':
        return {
          title: serviceTitle,
          color: GREEN,
          text: `💥 <@${service.userId}>: _Your deploy succeeded!_${
            service.buildUrl ? ` (<${service.buildUrl}|view on CodeBuild>)` : ''
          }`,
          // The TypeScript definition wants a string but a number is fine.
          ts: service.timestamp as any,
        };

      case 'FAILED':
        return {
          title: serviceTitle,
          color: FREEDOM_RED,
          text: `😫 <@${service.userId}>: _Your deploy failed._${
            service.buildUrl ? ` (<${service.buildUrl}|view on CodeBuild>)` : ''
          }`,
          // The TypeScript definition wants a string but a number is fine.
          ts: service.timestamp as any,
        };

      case 'OUTOFDATE':
        return {
          title: serviceTitle,
          text: '🕰 _There’s a newer version of this service to deploy._',
        };

      default:
        return {};
    }
  }

  async handleApproveInteraction(
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

    try {
      // TODO(finh): Keep approved list of users who may do this
      service.userId = payload.user.id;
      service.timestamp = Date.now() / 1000;

      if (
        this.commitsByEnvironmentServiceAndVariant[
          `${deploy.environment}/${service.fullName}`
        ] !== deploy.commit
      ) {
        service.status = 'OUTOFDATE';
      } else if (service.status !== 'REQUESTING') {
        // ignore
      } else if (action.value === 'ignore') {
        service.status = 'IGNORED';
      } else if (action.value === 'approve') {
        const [buildUrl, successPromise] = await this.runDeploy(
          deploy,
          service
        );

        service.status = 'DEPLOYING';
        service.timestamp = Date.now() / 1000;
        service.buildUrl = buildUrl;

        successPromise.then(
          success => {
            service.status = success ? 'DEPLOYED' : 'FAILED';
            service.timestamp = Date.now() / 1000;
            respond(this.makeDeploymentMessage(deploy));
          },
          e => {
            service.status = 'ERROR';
            service.errorMessage = e.toString();
            service.timestamp = Date.now() / 1000;
            respond(this.makeDeploymentMessage(deploy));
          }
        );
      }
    } catch (e) {
      service.status = 'ERROR';
      service.errorMessage = e.toString();
      // eslint-disable-next-line no-console
      console.error(e);
    }
    this.deploysByTimestamp.set(payload.message_ts, deploy);
    return this.makeDeploymentMessage(deploy);
  }

  /**
   * This method starts the CodeBuild build process. It returns a URL to the
   * CodeBuild job and a promise that will resolve with either true or false
   * depending on whether the build succeeded or failed.
   */
  private async runDeploy(
    deploy: DeployRecord,
    service: ServiceDeployRecord
  ): Promise<[string, Promise<boolean>]> {
    // For prod we first move the production branch for the service, then
    // trigger the CodeBuild. This gives us a record of what has and hasn’t
    // shipped to prod.
    if (deploy.environment === 'production') {
      await this.updateProductionBranch(deploy, service);
    }

    const { build } = await this.codebuild
      .startBuild({
        projectName: DIGITAL_REPO_CODEBUILD_PROJECT,
        sourceVersion: `${deploy.environment}/${service.fullName}`,
      })
      .promise();

    if (!build) {
      throw new Error('CodeBuild did not return a build.');
    }

    return [
      `https://console.aws.amazon.com/codesuite/codebuild/projects/${DIGITAL_REPO_CODEBUILD_PROJECT}/build/${encodeURIComponent(
        build.id!
      )}/log`,
      this.waitForBuild(build),
    ];
  }

  private async waitForBuild(build: CodeBuild.Build): Promise<boolean> {
    let interval;

    try {
      const startTime = Date.now();
      return await new Promise<boolean>((resolve, reject) => {
        interval = setInterval(async () => {
          // We wrap the whole body in try/catch so we can make sure to
          // resolve the promise and clear the interval.
          try {
            if (Date.now() - startTime > 1000 * 60 * 60 * 2) {
              throw new Error('Timeout checking build status');
            }

            const { builds } = await this.codebuild
              .batchGetBuilds({
                ids: [build.id!],
              })
              .promise();

            const latestBuild = builds && builds[0];

            if (!latestBuild) {
              throw new Error(`Did not get a result for ${build.id}`);
            }

            switch (latestBuild.buildStatus) {
              case 'IN_PROGRESS':
                break;
              case 'SUCCEEDED':
                resolve(true);
                return;
              case 'FAILED':
                resolve(false);
                return;
              default:
                throw new Error(
                  `Unexpected build status: ${latestBuild.buildStatus}`
                );
            }
          } catch (e) {
            reject(e);
          }
        }, 5000);
      });
    } finally {
      // No matter what happens, stop looping.
      clearInterval(interval);
    }
  }

  private makeGitHubAuthorization() {
    return (
      'Basic ' +
      Buffer.from(
        this.githubCredentials.username + ':' + this.githubCredentials.password
      ).toString('base64')
    );
  }

  private async updateProductionBranch(
    deploy: DeployRecord,
    service: ServiceDeployRecord
  ) {
    const productionBranchRef = `refs/heads/production/${service.name}`;

    // TODO(finh): Support creating the ref if it doesn’t exist already.
    const updateResponse = await fetch(
      `https://api.github.com/repos/${deploy.repo}/git/${productionBranchRef}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: this.makeGitHubAuthorization(),
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          sha: deploy.commit,
          // production releases must always be fast-forward
          force: false,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        `Could not update branch: ${await updateResponse.text()}`
      );
    }
  }
}
