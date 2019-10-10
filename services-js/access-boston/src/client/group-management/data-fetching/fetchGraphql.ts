import fetch from 'node-fetch';

export async function fetchGraphql(query: string, variables: any) {
  const defaultGraphQLUrl =
    'https://group-mgmt.digital-staging.boston.gov/graphql';
  const groupManagementApiUrl =
    process.env.GROUP_MANAGEMENT_API_URL || defaultGraphQLUrl;

  if (groupManagementApiUrl) {
    return await fetch(groupManagementApiUrl as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables,
      }),
    })
      .then(response => response.json())
      .then(response => response.data);
  } else {
    // eslint-disable-next-line no-console
    console.error('GROUP_MANAGEMENT_API_URL value missing from .env');
  }
}
