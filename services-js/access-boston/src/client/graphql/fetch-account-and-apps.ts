import { fetchGraphql, gql } from '@cityofboston/next-client-common';
import { FetchAccountAndAppsQuery } from './queries';
import { IncomingMessage } from 'http';

export type Account = FetchAccountAndAppsQuery['account'];
export type Apps = FetchAccountAndAppsQuery['apps'];

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
export default async function fetchAccountAndApps(req: IncomingMessage) {
  return await fetchGraphql<FetchAccountAndAppsQuery>(QUERY, null, req);
}
