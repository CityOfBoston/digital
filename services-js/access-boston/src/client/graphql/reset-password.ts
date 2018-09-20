import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import { ResetPassword, ResetPasswordVariables } from './queries';

const QUERY = gql`
  mutation ResetPassword($newPassword: String!, $confirmPassword: String!) {
    resetPassword(
      newPassword: $newPassword
      confirmPassword: $confirmPassword
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
  newPassword,
  confirmPassword
) {
  const args: ResetPasswordVariables = {
    newPassword,
    confirmPassword,
  };

  return ((await fetchGraphql(QUERY, args)) as ResetPassword).resetPassword;
}
