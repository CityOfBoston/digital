import { fetchGraphql, gql } from '@cityofboston/next-client-common';
import { FetchCommissions } from './queries';

const QUERY = gql`
  query FetchCommissions {
    commissions {
      id
      name
      openSeats
      homepageUrl
    }
  }
`;

export type Commission = FetchCommissions['commissions'][0];

export default async function fetchCommissions(): Promise<Commission[]> {
  return (await fetchGraphql<FetchCommissions>(QUERY)).commissions;
}
