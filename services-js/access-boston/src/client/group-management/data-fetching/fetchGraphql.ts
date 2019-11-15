import fetch from 'node-fetch';

export async function fetchGraphql(
  query: string,
  variables: any,
  _api: any = undefined
) {
  const retFascade = await fetch('/fetchGraphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(response => response.json())
    .then(response => response.data);
  return retFascade;
}
