import { fetchGraphql, gql } from '@cityofboston/next-client-common';
import { FetchCommissionsQuery } from './queries';

const QUERY = gql`
  query FetchCommissions {
    commissions {
      id
      name
      openSeats
    }
  }
`;

export type Commission = FetchCommissionsQuery['commissions'][0];

export default async function fetchCommissions(): Promise<Commission[]> {
  return (await fetchGraphql<FetchCommissionsQuery>(QUERY)).commissions;
}
