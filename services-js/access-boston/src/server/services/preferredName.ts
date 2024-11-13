import fetch from 'node-fetch';

export interface workflowReqArgs {
  id: string;
  preferredFirstName?: string;
  preferredLastName?: string;
  email?: string;
}

export interface workflowArgs {
  identityName: string;
  preferredFirstName?: string;
  preferredLastName?: string;
  email?: string;
}

export interface requestWorkflow {
  workflowArgs: workflowArgs;
}

export const basicAuthBase64Str = (
  user: string = '',
  pass: string = ''
): string => {
  return 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
};

export const requestNewNameEmail = async (params: {
  endpoint: string;
  requestJson: requestWorkflow;
  authStr: string;
}) => {
  const { endpoint, requestJson, authStr } = params;
  console.log(`requestJson: `, requestJson);

  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authStr,
    },
    body: JSON.stringify(requestJson),
  })
    .then(response => response.json())
    .then(response => response)
    .catch(error => {
      console.log('/preferred-name Error(requestNewNameEmail):', error);
      return {};
    });
};
