// DEPRECATED: IdentityIQ workflow functions have been removed.
// The preferred name flow now uses COBRA services:
// - CreateUniqueEmail (cobra/CreateUniqueEmail.ts) for generating unique email addresses
// - PreferredNameService (cobra/PreferredName.ts) for updating preferred name

// This file is kept for client-side wrapper functions and security validation

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

/**
 * Client-side wrapper for /preferred-name-request endpoint
 * This now calls COBRA EmailCheckService on the backend
 */
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

/**
 * Client-side wrapper for /preferred-name-submit endpoint
 * This now calls COBRA PreferredNameService on the backend
 */
export const preferredNameSubmit = async (data: {
  id: string;
  preferredFirstName?: string;
  preferredLastName?: string;
  email?: string;
}) => {
  const { id, preferredFirstName = '', preferredLastName = '', email } = data;
  const workflowArgsObj: Record<string, string> = {
    id,
    preferredFirstName,
    preferredLastName,
  };

  if (email && email.trim().length > 0) {
    workflowArgsObj['email'] = email.trim();
  }

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
