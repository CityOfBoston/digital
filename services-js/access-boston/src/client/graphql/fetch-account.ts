import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { FetchAccountQuery } from './queries';

export type Account = FetchAccountQuery['account'];

const QUERY = gql`
  query FetchAccount {
    account {
      employeeId
    }
  }
`;

export default async function fetchAccount(fetchGraphql: FetchGraphql) {
  return ((await fetchGraphql(QUERY)) as FetchAccountQuery).account;
}
