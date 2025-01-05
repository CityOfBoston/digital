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

export const $preferredNameRequest = async (data: {
  id: string;
  preferredFirstName: string;
  preferredLastName: string;
}) => {
  const { id, preferredFirstName, preferredLastName } = data;
  return await fetch(`/preferred-name-request` as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, preferredFirstName, preferredLastName }),
  })
    .then(response => response.json())
    .then(response => response)
    .catch(error => {
      console.log('/preferred-name Error(requestNewNameEmail):', error);
      return {};
    });
};

export const allowPreferredNameEndpointReq = (
  req: {
    info: { referrer: string; host: string };
  },
  apiToken?: string
) => {
  return (
    req.info.referrer.toLowerCase().includes(req.info.host.toLowerCase()) ||
    (req['headers'] &&
      req['headers']['token'] &&
      (req['headers']['token'] as string)) === (apiToken as string)
  );
};

export const preferredNameRequest = async (data: {
  id: string;
  preferredFirstName: string;
  preferredLastName: string;
}) => {
  const { id, preferredFirstName, preferredLastName } = data;

  return await fetch(`/preferred-name-request` as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, preferredFirstName, preferredLastName }),
  })
    .then(response => response.json())
    .then(response => response)
    .catch(error => {
      console.log(
        '/preferred-name-request Error(preferredNameRequest):',
        error
      );
      return {};
    });
};

export const preferredNameSubmit = async (data: {
  id: string;
  preferredFirstName?: string;
  preferredLastName?: string;
  email?: string;
}) => {
  const { id, preferredFirstName, preferredLastName, email } = data;
  let workflowArgsObj = { id };

  if (preferredFirstName && preferredFirstName.length > 1)
    workflowArgsObj['preferredFirstName'] = preferredFirstName;

  if (preferredLastName && preferredLastName.length > 1)
    workflowArgsObj['preferredLastName'] = preferredLastName;

  if (email && email.length > 1) workflowArgsObj['email'] = email;

  return await fetch(`/preferred-name-submit` as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflowArgsObj),
  })
    .then(response => response.json())
    .then(response => response)
    .catch(error => {
      console.log('/preferred-name-submit Error(preferredNameSubmit):', error);
      return {};
    });
};
