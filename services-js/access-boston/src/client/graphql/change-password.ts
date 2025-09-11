import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import { ChangePassword, ChangePasswordVariables } from './queries';

const QUERY = gql`
  mutation ChangePassword(
    $newPassword: String!
    $confirmPassword: String!
  ) {
    changePassword(
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

export default async function changePassword(
  fetchGraphql: FetchGraphql,
  newPassword,
  confirmPassword
) {
  const args: ChangePasswordVariables = {
    newPassword,
    confirmPassword,
  };

  return ((await fetchGraphql(QUERY, args)) as ChangePassword).changePassword;
}
