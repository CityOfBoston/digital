import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import {
  VerifyMfaDevice_verifyMfaDevice,
  VerifyMfaDeviceVariables,
  VerifyMfaDevice,
} from './queries';

const QUERY = gql`
  mutation VerifyMfaDevice($sessionId: String!, $pairingCode: String!) {
    verifyMfaDevice(sessionId: $sessionId, pairingCode: $pairingCode) {
      success
      error
    }
  }
`;

// Renames just to not expose the GraphQL-generated type names.
export interface VerifyMfaDeviceResult
  extends VerifyMfaDevice_verifyMfaDevice {}

export default async function verifyMfaDevice(
  fetchGraphql: FetchGraphql,
  sessionId: string,
  pairingCode: string
): Promise<VerifyMfaDeviceResult> {
  const args: VerifyMfaDeviceVariables = {
    sessionId,
    pairingCode,
  };

  return ((await fetchGraphql(QUERY, args)) as VerifyMfaDevice).verifyMfaDevice;
}
