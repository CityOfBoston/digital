import fetch from 'node-fetch';

/** SAML nameId / employee id for group-mgmt integration logs. */
let actorEmployeeId: string | null = null;

export function setGroupMgmtActorEmployeeId(employeeId: string) {
  actorEmployeeId = employeeId;
}

export async function fetchGraphql(
  query: string,
  variables: any,
  _api: any = undefined
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (actorEmployeeId) {
    headers['x-ab-user-id'] = actorEmployeeId;
  }

  const retFascade = await fetch('/fetchGraphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(response => response.json())
    .then(response => response.data);
  return retFascade;
}
