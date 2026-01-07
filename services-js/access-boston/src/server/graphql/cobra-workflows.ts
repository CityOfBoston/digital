import { MutationResolvers } from './schema';
import { ChangePasswordService } from '../services/cobra/ChangePassword';
import { WorkflowStatus, PasswordError, Workflow } from './workflows';

export const cobraChangePasswordMutation: MutationResolvers['changePassword'] = async (
  _root,
  { newPassword, confirmPassword },
  context
) => {
  const { loginAuth, loginSession } = context.session;

  if (!loginAuth) {
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
      loginAuth.userId,
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
      loginSession!.needsNewPassword = false;
      context.session.save();
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
