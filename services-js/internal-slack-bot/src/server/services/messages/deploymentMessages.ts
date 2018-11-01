import { FREEDOM_RED, GREEN, OPTIMISTIC_BLUE } from '@cityofboston/react-fleet';
import { DeploymentType } from '../interactions/deploymentInteractions';

// https://api.slack.com/docs/message-buttons
export function deploymentApprovalInitialMessage(type: DeploymentType): any {
  return {
    // if you include a “text” node, there will be a “remove attachment” icon on attachment hover; moving the content to the “pretext” for the first attachment will prevent user attachment removal, and will visually look the same as was intended.
    response_type: 'in_channel',
    attachments: [
      {
        pretext:
          'I’ve received a *' +
          type.charAt(0).toUpperCase() +
          type.slice(1) +
          '* deployment request. ```' +
          'some random code' +
          '```',
        text: 'What would you like to do?',
        color: OPTIMISTIC_BLUE,
        callback_id: 'approve_deployment',
        actions: [
          {
            name: 'approve_deployment',
            text: 'Approve deployment',
            value: 'approve',
            type: 'button',
            style: 'primary',
          },
          {
            name: 'approve_deployment',
            text: 'Reject deployment',
            value: 'reject',
            type: 'button',
          },
        ],
      },
    ],
  };
}

export function deploymentCompletionMessage(isSuccess: boolean): any {
  return {
    response_type: 'in_channel',
    attachments: [
      {
        pretext: isSuccess ? 'Deployment complete!' : 'Deployment failed...',
        color: isSuccess ? GREEN : FREEDOM_RED,
      },
    ],
  };
}
