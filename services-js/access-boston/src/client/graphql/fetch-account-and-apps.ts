import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import {
  FetchAccountAndApps,
  FetchAccountAndApps_apps_categories_apps,
} from './queries';

export type Account = FetchAccountAndApps['account'];
export type Apps = FetchAccountAndApps['apps'];
export type CategoryApps = Array<FetchAccountAndApps_apps_categories_apps>;

const QUERY = gql`
  query FetchAccountAndApps {
    account {
      employeeId
      firstName
      lastName
      needsMfaDevice
      needsNewPassword
      hasMfaDevice
      resetPasswordToken
      mfaRequiredDate
      groups
      email
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
          target
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
