export interface workflowReqArgs {
  id: string;
  preferredFirsName?: string;
  preferredLastName?: string;
}

export interface workflowArgs {
  identityName: string;
  preferredFirsName?: string;
  preferredLastName?: string;
}

interface requestWorkflow {
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
      console.log('/preferred-name-request Error(requestNewNameEmail):', error);
      return {};
    });
};
