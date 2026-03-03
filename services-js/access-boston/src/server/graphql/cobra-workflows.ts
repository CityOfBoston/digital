import { MutationResolvers } from './schema';
import { ChangePasswordService } from '../services/cobra/ChangePassword';
import { PwdResetService } from '../services/cobra/PwdReset';
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

      // Clear the password reset flag in LDAP
      console.log('[ChangePassword] Clearing password reset flag for user:', loginAuth.userId);
      try {
        const pwdResetService = new PwdResetService(context.cobraClient);
        const pwdResetResult = await pwdResetService.clearPwdResetFlag(loginAuth.userId);
        
        if (pwdResetResult.success) {
          console.log('[ChangePassword] Password reset flag cleared successfully');
          
          // Wait 5 seconds for LDAP changes to propagate
          console.log('[ChangePassword] Waiting 5 seconds for LDAP propagation...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          console.log('[ChangePassword] LDAP propagation wait complete');
        } else {
          console.warn('[ChangePassword] Failed to clear password reset flag:', pwdResetResult.message);
          // Don't fail the whole operation - password was already changed
        }
      } catch (pwdResetError) {
        console.error('[ChangePassword] Error clearing password reset flag:', pwdResetError);
        // Don't fail the whole operation - password was already changed
      }
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
