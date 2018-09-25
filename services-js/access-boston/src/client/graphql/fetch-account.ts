import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { FetchAccount } from './queries';

export type Account = FetchAccount['account'];

const QUERY = gql`
  query FetchAccount {
    account {
      employeeId
      registered
      needsMfaDevice
      needsNewPassword
    }
  }
`;

export default async function fetchAccount(fetchGraphql: FetchGraphql) {
  return ((await fetchGraphql(QUERY)) as FetchAccount).account;
}
