import { fetchGraphql, gql } from '@cityofboston/next-client-common';
import { FetchAccountQuery } from './queries';
import { IncomingMessage } from 'http';

export type Account = FetchAccountQuery['account'];

const QUERY = gql`
  query FetchAccount {
    account {
      employeeId
    }
  }
`;

export default async function fetchAccount(req: IncomingMessage) {
  return (await fetchGraphql<FetchAccountQuery>(QUERY, null, req)).account;
}
