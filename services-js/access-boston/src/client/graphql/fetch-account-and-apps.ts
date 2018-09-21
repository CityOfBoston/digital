import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { FetchAccountAndApps } from './queries';

export type Account = FetchAccountAndApps['account'];
export type Apps = FetchAccountAndApps['apps'];

const QUERY = gql`
  query FetchAccountAndApps {
    account {
      employeeId
    }

    apps {
      categories {
        title
        showIcons
        requestAccessUrl
        apps {
          title
          url
          iconUrl
          description
        }
      }
    }
  }
`;

// We have the req because we need to do cookie auth to get the account info.
export default async function fetchAccountAndApps(
  fetchGraphql: FetchGraphql
): Promise<FetchAccountAndApps> {
  return await fetchGraphql(QUERY);
}
