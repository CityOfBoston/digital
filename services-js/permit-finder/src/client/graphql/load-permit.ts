import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import {
  LoadPermitVariables,
  LoadPermit_permit,
  LoadPermit,
  LoadPermit_permit_milestones,
} from './queries';

const QUERY = gql`
  query LoadPermit($permitNumber: String!) {
    permit(permitNumber: $permitNumber) {
      permitNumber
      kind
      type

      address
      city
      state
      zip

      milestones {
        milestoneName
        milestoneStartDate
        cityContactName
      }

      reviews {
        isComplete
        type
      }
    }
  }
`;

export type Permit = LoadPermit_permit;
export type Milestone = LoadPermit_permit_milestones;

export default async function loadPermit(
  fetchGraphql: FetchGraphql,
  permitNumber: string
): Promise<Permit | null> {
  const args: LoadPermitVariables = { permitNumber };
  return ((await fetchGraphql(QUERY, args)) as LoadPermit).permit;
}
