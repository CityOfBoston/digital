import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import { ResetPassword, ResetPasswordVariables } from './queries';

const QUERY = gql`
  mutation ResetPassword(
    $newPassword: String!
    $confirmPassword: String!
    $token: String!
  ) {
    resetPassword(
      newPassword: $newPassword
      confirmPassword: $confirmPassword
      token: $token
    ) {
      caseId
      status
      error
      messages
    }
  }
`;

export default async function resetPassword(
  fetchGraphql: FetchGraphql,
  newPassword: string,
  confirmPassword: string,
  token: string
) {
  const args: ResetPasswordVariables = {
    newPassword,
    confirmPassword,
    token,
  };

  return ((await fetchGraphql(QUERY, args)) as ResetPassword).resetPassword;
}
