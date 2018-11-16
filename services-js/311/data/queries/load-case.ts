import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import { LoadCaseVariables, LoadCase } from './types';

const QUERY = gql`
  query LoadCase($id: String!) {
    case(id: $id) {
      id
      service {
        name
        code
      }
      status
      serviceNotice
      closureReason
      closureComment
      description
      address
      location {
        lat
        lng
      }
      images {
        tags
        originalUrl
        squarePreviewUrl
      }
      requestedAtString(format: "MMMM D, YYYY, h:mm A")
      updatedAtString(format: "MMMM D, YYYY, h:mm A")
      expectedAtString(format: "dddd, MMMM D, YYYY")
    }
  }
`;

/**
 * Load a single service request from its id (e.g. "17-00001615"). Returns
 * null if the request is not found.
 */
export default async function loadCase(fetchGraphql: FetchGraphql, id: string) {
  const queryVariables: LoadCaseVariables = { id };
  const response: LoadCase = await fetchGraphql(QUERY, queryVariables);
  return response.case;
}
