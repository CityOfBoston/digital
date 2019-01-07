import fetch from 'node-fetch';
import url from 'url';

const TASK_RESULT_SCHEMA =
  'urn:ietf:params:scim:schemas:sailpoint:1.0:TaskResult';
const LAUNCHED_WORKFLOW_SCHEMA =
  'urn:ietf:params:scim:schemas:sailpoint:1.0:LaunchedWorkflow';

const CHANGE_PASSWORD_WORKFLOW = 'CoB-Workflow-ChangePasswordRESTOnly';
const RESET_PASSWORD_WORKFLOW = 'CoB-Workflow-ForgortPassword';
const REGISTER_USER_WORKFLOW = 'CoB-Workflow-MFARegistration';

export interface WorkflowResponse {
  totalResults: number;
  startIndex: number;
  schemas: string[];
  Resources: WorkflowDescription[];
}

export interface WorkflowDescription {
  meta: {
    created: string;
    location: string;
    version: string;
    resourceType: 'Workflow';
  };
  schemas: string[];
  name: string;
  id: string;
  type?: string;
  description?: string;
}

interface ApiError {
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'];
  detail: string;
  status: '500';
}

interface LaunchWorkflowRequest {
  schemas: string[];
  [LAUNCHED_WORKFLOW_SCHEMA]: {
    workflowName: string;
    input: Array<{
      key: string;
      value: string;
      type?: string;
    }>;
  };
}

export interface LaunchedWorkflowResponse {
  partitioned: boolean;
  completed?: string;
  type: 'Workflow';
  launched: string;
  pendingSignoffs: number;
  [LAUNCHED_WORKFLOW_SCHEMA]: {
    output: Array<{
      type?: string;
      value: string;
      key: string;
    }>;
    input: [{}];
    workflowSummary: string;
    workflowName: string;
  };
  meta: {
    created: string;
    location: string;
    version: string;
    resourceType: 'LaunchedWorkflow';
  };
  schemas: string[];
  name: string;
  messages: string[];
  attributes: Array<{
    value: string;
    key: string;
    type?: string;
  }>;
  id: string;
  completionStatus?: 'Error' | 'Success';
  taskDefinition: string;
  terminated: boolean;
  launcher: string;
}

/**
 * Service to connect to IdentityIQ to change passwords and handle other
 * workflow tasks.
 */
export default class IdentityIq {
  private url: string;
  private username: string;
  private password: string;

  constructor(
    url: string | undefined,
    username: string | undefined,
    password: string | undefined
  ) {
    if (!url) {
      throw new Error('IdentityIQ URL not provided');
    }

    if (!username) {
      throw new Error('IdentityIQ username not provided');
    }

    if (!password) {
      throw new Error('IdentityIQ password not provided');
    }

    this.url = url;
    this.username = username;
    this.password = password;
  }

  private makeScimUrl(path: string): string {
    return url.resolve(this.url, `scim/v2/${path}`);
  }

  private makeDefaultHeaders() {
    return {
      Authorization:
        'Basic ' +
        Buffer.from(this.username + ':' + this.password).toString('base64'),
    };
  }

  private async makeScimRequest(
    path: string,
    method: string = 'GET',
    body: any = undefined
  ): Promise<any> {
    const response = await fetch(this.makeScimUrl(path), {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: this.makeDefaultHeaders(),
      timeout: 60 * 1000,
    });

    if (!response.ok) {
      const responseText = await response.json();
      try {
        const apiError: ApiError = JSON.parse(responseText);
        throw new Error(apiError.detail);
      } catch {
        // eslint-disable-next-line no-console
        console.error(responseText);
        throw new Error(`IdentityIQ ${response.statusText}`);
      }
    }

    const output = await response.json();
    // eslint-disable-next-line no-console
    console.debug(JSON.stringify(output, null, 2));
    return output;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<LaunchedWorkflowResponse> {
    const requestBody: LaunchWorkflowRequest = {
      schemas: [LAUNCHED_WORKFLOW_SCHEMA, TASK_RESULT_SCHEMA],
      [LAUNCHED_WORKFLOW_SCHEMA]: {
        workflowName: CHANGE_PASSWORD_WORKFLOW,
        input: [
          {
            key: 'currentSecret',
            value: currentPassword,
          },
          {
            key: 'newSecret',
            value: newPassword,
          },
          {
            key: 'launcher',
            value: userId,
          },
          {
            key: 'transient',
            value: 'false',
          },
        ],
      },
    };

    return this.makeScimRequest('LaunchedWorkflows', 'POST', requestBody);
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    token: string
  ): Promise<LaunchedWorkflowResponse> {
    const requestBody: LaunchWorkflowRequest = {
      schemas: [LAUNCHED_WORKFLOW_SCHEMA, TASK_RESULT_SCHEMA],
      [LAUNCHED_WORKFLOW_SCHEMA]: {
        workflowName: RESET_PASSWORD_WORKFLOW,
        input: [
          {
            key: 'newSecret',
            value: newPassword,
          },
          {
            key: 'launcher',
            value: userId,
          },
          {
            key: 'token',
            value: token,
          },
          {
            key: 'transient',
            value: 'false',
          },
        ],
      },
    };

    return this.makeScimRequest('LaunchedWorkflows', 'POST', requestBody);
  }

  /**
   * Updates the User in IIQ to indicate that device registration has succeeded.
   * Saves the email or phone number used for the device.
   */
  async updateUserRegistration(
    userId: string,
    { email, phoneNumber }: { email?: string; phoneNumber?: string }
  ) {
    const requestBody: LaunchWorkflowRequest = {
      schemas: [LAUNCHED_WORKFLOW_SCHEMA, TASK_RESULT_SCHEMA],
      [LAUNCHED_WORKFLOW_SCHEMA]: {
        workflowName: REGISTER_USER_WORKFLOW,
        input: [
          {
            key: 'mfaEmail',
            value: email || '',
          },
          {
            key: 'mfaPhone',
            value: phoneNumber || '',
          },
          {
            key: 'launcher',
            value: userId,
          },
          {
            key: 'isUserRegistered',
            value: 'true',
          },
          {
            key: 'transient',
            value: 'false',
          },
        ],
      },
    };

    return this.makeScimRequest('LaunchedWorkflows', 'POST', requestBody);
  }

  async fetchWorkflow(caseId: string): Promise<LaunchedWorkflowResponse> {
    return this.makeScimRequest(`LaunchedWorkflows/${caseId}`);
  }
}
