import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import {
  AddMfaDeviceVariables,
  AddMfaDevice,
  AddMfaDevice_addMfaDevice,
} from './queries';

const QUERY = gql`
  mutation AddMfaDevice(
    $phoneNumber: String
    $email: String
    $type: VerificationType!
  ) {
    addMfaDevice(phoneNumber: $phoneNumber, email: $email, type: $type) {
      sessionId
      error
    }
  }
`;

// Renames just to not expose the GraphQL-generated type names.
export type AddMfaDeviceArgs = Required<AddMfaDeviceVariables>;
export interface AddMfaDeviceResult extends AddMfaDevice_addMfaDevice {}

export default async function addMfaDevice(
  fetchGraphql: FetchGraphql,
  args: AddMfaDeviceArgs
): Promise<AddMfaDeviceResult> {
  return ((await fetchGraphql(QUERY, args)) as AddMfaDevice).addMfaDevice;
}
