import { FetchGraphql, gql } from '@cityofboston/next-client-common';
import {
  ChangePasswordMutation,
  ChangePasswordMutationVariables,
} from './queries';

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
  const args: ChangePasswordMutationVariables = {
    currentPassword,
    newPassword,
    confirmPassword,
  };

  return ((await fetchGraphql(QUERY, args)) as ChangePasswordMutation)
    .changePassword;
}
