import fetch from 'node-fetch';

export async function fetchGraphql(query: string, variables: any) {
  const groupManagementApiUrl =
    process.env.GROUP_MANAGEMENT_API_URL ||
    'https://group-mgmt-dev.digital-staging.boston.gov/graphql';
  // eslint-disable-next-line no-console
  // console.log('fetchGraphql > variables: ', variables);
  // console.log('fetchGraphql > query: ', query);
  // eslint-disable-next-line no-console
  // console.log('groupManagementApiUrl: ', groupManagementApiUrl);
  // eslint-disable-next-line no-console
  // console.log(
  //   'process.env.GROUP_MANAGEMENT_API_URL: ',
  //   process.env.GROUP_MANAGEMENT_API_URL
  // );

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
