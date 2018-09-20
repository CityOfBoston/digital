import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import { ChangePassword, ChangePasswordVariables } from './queries';

const QUERY = gql`
  mutation ChangePassword(
    $currentPassword: String!
    $newPassword: String!
    $confirmPassword: String!
  ) {
    changePassword(
      currentPassword: $currentPassword
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
  currentPassword,
  newPassword,
  confirmPassword
) {
  const args: ChangePasswordVariables = {
    currentPassword,
    newPassword,
    confirmPassword,
  };

  return ((await fetchGraphql(QUERY, args)) as ChangePassword).changePassword;
}
