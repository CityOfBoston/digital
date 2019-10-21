import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { FetchAccount } from './queries';

export type Account = FetchAccount['account'];

const QUERY = gql`
  query FetchAccount {
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
  }
`;

export default async function fetchAccount(fetchGraphql: FetchGraphql) {
  return ((await fetchGraphql(QUERY)) as FetchAccount).account;
}
