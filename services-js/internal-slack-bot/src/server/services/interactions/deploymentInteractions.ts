import { formatDateTime } from '../../../scripts/helpers';

export type DeploymentType = 'production' | 'staging';

export function deploymentApprovalInteraction(payload, respond): void {
  const timestamp = payload.action_ts.split('.')[0];

  if (payload.actions[0].value === 'approve') {
    respond({
      text: `Deploying... _(approved by <@${
        payload.user.id
      }> at <!date^${timestamp}^{date_num} {time_secs}|${formatDateTime(
        timestamp
      )}>)_`,
    });

    // todo: trigger deployment
    // todo: deployment success/fail should be a separate bot message to channel
  } else {
    respond({
      text: `Deployment was rejected by <@${
        payload.user.id
      }> at <!date^${timestamp}^{date_num} {time_secs}|${formatDateTime(
        timestamp
      )}>`,
    });

    // todo: abort deployment
    // todo: if abort fails, make another bot message to channel
    // todo: OR this response says “user x rejected deploy” and then make separate confirmation bot message to channel?
  }
}
