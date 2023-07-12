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
    .then(response => response.data)
    .catch(error => {
      console.log('Error fetchGraphql: ', error);
      console.error('Error fetchGraphql: ', error);

      return {};
    });
  return retFascade;
}
