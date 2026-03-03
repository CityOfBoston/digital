import { MutationResolvers } from './schema';
import { ChangePasswordService } from '../services/cobra/ChangePassword';
import { PwdResetService } from '../services/cobra/PwdReset';
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
      // Clear the password reset flag in LDAP
      console.log('[ResetPassword] Clearing password reset flag for user:', forgotPasswordAuth.userId);
      try {
        const pwdResetService = new PwdResetService(context.cobraClient);
        const pwdResetResult = await pwdResetService.clearPwdResetFlag(forgotPasswordAuth.userId);
        
        if (pwdResetResult.success) {
          console.log('[ResetPassword] Password reset flag cleared successfully');
          
          // Wait 5 seconds for LDAP changes to propagate
          console.log('[ResetPassword] Waiting 5 seconds for LDAP propagation...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          console.log('[ResetPassword] LDAP propagation wait complete');
        } else {
          console.warn('[ResetPassword] Failed to clear password reset flag:', pwdResetResult.message);
          // Don't fail the whole operation - password was already changed
        }
      } catch (pwdResetError) {
        console.error('[ResetPassword] Error clearing password reset flag:', pwdResetError);
        // Don't fail the whole operation - password was already changed
      }

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
