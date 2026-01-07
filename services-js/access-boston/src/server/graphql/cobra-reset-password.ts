import { MutationResolvers } from './schema';
import { ChangePasswordService } from '../services/cobra/ChangePassword';
import { WorkflowStatus, PasswordError, Workflow } from './workflows';

export const cobraResetPasswordMutation: MutationResolvers['resetPassword'] = async (
  _root,
  { newPassword, confirmPassword },
  context
) => {
  const { forgotPasswordAuth } = context.session;

  if (!forgotPasswordAuth) {
    return {
      caseId: null,
      error: PasswordError.NO_SESSION,
      messages: [],
      status: WorkflowStatus.ERROR,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      caseId: null,
      error: PasswordError.NEW_PASSWORDS_DONT_MATCH,
      messages: [],
      status: WorkflowStatus.ERROR,
    };
  }

  const changePasswordService = new ChangePasswordService(context.cobraClient);
  
  try {
    const response = await changePasswordService.changePassword(
      forgotPasswordAuth.userId,
      newPassword,
      confirmPassword
    );

    // Check if it's an error response
    if ('error' in response) {
      return {
        caseId: null,
        error: response.message || PasswordError.UNKNOWN_ERROR,
        messages: [response.error],
        status: WorkflowStatus.ERROR,
      };
    }

    // Handle success response
    const result: Workflow = {
      caseId: response.requestId,
      error: null,
      messages: [response.message],
      status: WorkflowStatus.SUCCESS,
    };

    if (result.status === WorkflowStatus.SUCCESS) {
      // Clear the forgot password session on success
      context.session.reset();
    }

    return result;
  } catch (error) {
    return {
      caseId: null,
      error: PasswordError.UNKNOWN_ERROR,
      messages: [error.message],
      status: WorkflowStatus.ERROR,
    };
  }
};
