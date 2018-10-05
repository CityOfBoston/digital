import fetch from 'node-fetch';
import url from 'url';

const TASK_RESULT_SCHEMA =
  'urn:ietf:params:scim:schemas:sailpoint:1.0:TaskResult';
const LAUNCHED_WORKFLOW_SCHEMA =
  'urn:ietf:params:scim:schemas:sailpoint:1.0:LaunchedWorkflow';
const USER_SCHEMA = 'urn:ietf:params:scim:schemas:sailpoint:1.0:User';
const ENTERPRISE_USER_SCHEMA =
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';

const CHANGE_PASSWORD_WORKFLOW = 'COB-RESTAPI-Workflow-ChangePassword';
// TODO(finh): Update when the final workflow is done
const RESET_PASSWORD_WORKFLOW = 'REST_API_TEST2_WORKFLOW';

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

interface UserResponse {
  [USER_SCHEMA]: {
    capabilities: [];
    lastRefresh: string;
    sAMAccountName: string;
    departmentCode: string;
    employeeId: string;
    telephone: string;
    managerId: string;
    cobHireDate: string;
    ssn: string;
    iiqFriendlyDeptName: string;
    emailAliases: string[];
    emplClass: string;
    cobPrimaryJobCode: string;
    iiqFriendlyLocName: string;
    isManager: boolean;
    isVerifyingIdentity: string;
    accounts: Array<{
      displayName: string;
      value: string;
      $ref: string;
    }>;
    cobJobLocationCode: string;
    isPasswordExpired: string;
    cobBusRelTypeCode: string;
    status: string;
    pwdLastSet: string;
    isUserRegistered?: string;
    userPhone?: string;
    userEmail?: string;
  };

  emails: Array<{
    type: string;
    value: string;
    primary: boolean;
  }>;

  displayName: string;

  meta: {
    created: string;
    location: string;
    lastModified: string;
    version: string;
    resourceType: 'User';
  };

  schemas: string[];

  name: {
    formatted: string;
    familyName: string;
    givenName: string;
  };

  active: boolean;
  id: string;
  userName: string;

  [ENTERPRISE_USER_SCHEMA]: {
    manager: {
      displayName: string;
      value: string;
      $ref: string;
    };
  };
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

    const response = await fetch(this.makeScimUrl('LaunchedWorkflows'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        ...this.makeDefaultHeaders(),
      },
    });

    if (response.status !== 201) {
      const apiError: ApiError = await response.json();
      throw new Error(apiError.detail);
    }

    const output = await response.json();
    // eslint-disable-next-line no-console
    console.debug(JSON.stringify(output, null, 2));
    return output;
  }

  async resetPassword(
    userId: string,
    newPassword: string
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
            key: 'transient',
            value: 'false',
          },
        ],
      },
    };

    const response = await fetch(this.makeScimUrl('LaunchedWorkflows'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        ...this.makeDefaultHeaders(),
      },
    });

    if (response.status !== 201) {
      const apiError: ApiError = await response.json();
      throw new Error(apiError.detail);
    }

    const output = await response.json();
    // eslint-disable-next-line no-console
    console.debug(JSON.stringify(output, null, 2));
    return output;
  }

  /**
   * Updates the User in IIQ to indicate that device registration has succeeded.
   * Saves the email or phone number used for the device.
   */
  async updateUserRegistration(
    userId: string,
    { email, phoneNumber }: { email?: string; phoneNumber?: string }
  ) {
    // IIQ doesn’t support PATCHing User objects over SCIM, so we have to
    // download the entire object and then re-upload the modified one.
    const userResponse = await fetch(this.makeScimUrl(`Users/${userId}`), {
      headers: this.makeDefaultHeaders(),
    });

    if (!userResponse.ok) {
      const apiError: ApiError = await userResponse.json();
      throw new Error(apiError.detail);
    }

    // WARNING: This response may have the last 4 of the employee’s SSN. Do not
    // log without masking it.
    const user: UserResponse = await userResponse.json();

    user[USER_SCHEMA].isUserRegistered = 'true';

    if (email) {
      user[USER_SCHEMA].userEmail = email;
    }

    if (phoneNumber) {
      user[USER_SCHEMA].userPhone = phoneNumber;
    }

    const updateResponse = await fetch(this.makeScimUrl(`Users/${userId}`), {
      method: 'PUT',
      headers: this.makeDefaultHeaders(),
      body: JSON.stringify(user),
    });

    if (!updateResponse.ok) {
      const apiError: ApiError = await updateResponse.json();
      throw new Error(apiError.detail);
    }
  }

  async fetchWorkflow(caseId: string): Promise<LaunchedWorkflowResponse> {
    const response = await fetch(
      this.makeScimUrl(`LaunchedWorkflows/${caseId}`),
      {
        headers: {
          ...this.makeDefaultHeaders(),
        },
      }
    );

    if (response.status !== 200) {
      const apiError: ApiError = await response.json();
      throw new Error(apiError.detail);
    }

    return await response.json();
  }
}
