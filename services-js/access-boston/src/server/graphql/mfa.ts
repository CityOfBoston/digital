import { MutationResolvers } from './schema';
import Boom from 'boom';
import { ErrorId as PingErrorId } from '../services/PingId';

export enum MfaError {
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  WRONG_CODE = 'WRONG_CODE',
  ALREADY_REGISTERED = 'ALREADY_REGISTERED',
}

export interface AddMfaDeviceResponse {
  sessionId: string | null;
  error: MfaError | null;
}

export interface VerifyMfaDeviceResponse {
  success: boolean;
  error: MfaError | null;
}

export const addMfaDeviceMutation: MutationResolvers['addMfaDevice'] = async (
  _root,
  { email, phoneNumber, type },
  { pingId, session }
) => {
  const { loginAuth, loginSession } = session;

  if (!loginAuth || !loginSession) {
    throw Boom.forbidden('No login session found', session.sessionDebugInfo());
  }

  const { userId } = loginAuth;
  const {
    firstName,
    lastName,
    email: registeredEmail,
    hasMfaDevice,
  } = loginSession;

  if (hasMfaDevice) {
    return {
      sessionId: null,
      error: MfaError.ALREADY_REGISTERED,
    };
  }

  const pingUser = await pingId.getUserDetails(userId);

  if (!pingUser) {
    await pingId.addUser({
      userId,
      firstName,
      lastName,
      email: registeredEmail,
    });
  }

  let phoneOrEmail: string;
  switch (type) {
    case 'EMAIL':
      if (email) {
        phoneOrEmail = email;
        loginSession.mfaEmail = email;
        loginSession.mfaPhoneNumber = null;
      } else {
        throw new Error('Missing email address for EMAIL verification type');
      }
      break;

    case 'VOICE':
    case 'SMS':
      if (phoneNumber) {
        phoneNumber = stripNonDigits(phoneNumber);

        phoneOrEmail = phoneNumber;
        loginSession.mfaEmail = null;
        loginSession.mfaPhoneNumber = phoneNumber;
      } else {
        throw new Error(`Missing phone number for ${type} verification type`);
      }
      break;

    default:
      throw new Error(`Unknown verification type: ${type}`);
  }

  // The combination of the frontend and PingID handles input validation, so we
  // don't have to here.
  const sessionId = await pingId.startPairing(userId, type, phoneOrEmail);

  loginSession.mfaSessionId = sessionId;
  session.save();

  return {
    sessionId,
    error: null,
  };
};

export const verifyMfaDeviceMutation: MutationResolvers['verifyMfaDevice'] = async (
  _root,
  { sessionId, pairingCode },
  { pingId, cobraClient, session }
) => {
  const { loginAuth, loginSession } = session;

  if (!loginAuth || !loginSession) {
    throw Boom.forbidden('No login session found', session.sessionDebugInfo());
  }

  // Small safety check to ensure that the email address or phone number in the
  // session is the one that corresponds to this verification check.
  if (loginSession.mfaSessionId !== sessionId) {
    throw Boom.badRequest(
      'MFA session ID does not match the stored session ID'
    );
  }

  const result = await pingId.finalizePairing(sessionId, pairingCode);

  if (result !== true) {
    return {
      success: false,
      error: result === PingErrorId.WRONG_PASSWORD ? MfaError.WRONG_CODE : null,
    };
  }

  loginSession.mfaSessionId = null;
  session.save();

  // eslint-disable-next-line no-console
  console.log('[MFA] Starting COBRA MFA update for user:', loginAuth.userId);
  // eslint-disable-next-line no-console
  console.log('[MFA] Update data - email:', loginSession.mfaEmail, 'phoneNumber:', loginSession.mfaPhoneNumber);
  
  const updateStartTime = Date.now();
  try {
    // Use COBRA to update LDAP directly instead of IdentityIQ
    const { UpdateMFAService } = await import('../services/cobra/UpdateMFA');
    const updateMFAService = new UpdateMFAService(cobraClient);
    
    const cobraResponse = await updateMFAService.updateMFA(
      loginAuth.userId,
      true, // isRegistered = true
      loginSession.mfaEmail || undefined,
      loginSession.mfaPhoneNumber || undefined
    );
    
    const updateDuration = Date.now() - updateStartTime;
    // eslint-disable-next-line no-console
    console.log(`[MFA] COBRA MFA update successful in ${updateDuration}ms`);
    // eslint-disable-next-line no-console
    console.log('[MFA] COBRA response:', JSON.stringify(cobraResponse, null, 2));
  } catch (cobraError) {
    const updateDuration = Date.now() - updateStartTime;
    // eslint-disable-next-line no-console
    console.error(`[MFA ERROR] COBRA update FAILED after ${updateDuration}ms`);
    // eslint-disable-next-line no-console
    console.error('[MFA ERROR] Error:', cobraError);
    // eslint-disable-next-line no-console
    console.error('[MFA ERROR] Error details:', JSON.stringify(cobraError, Object.getOwnPropertyNames(cobraError), 2));
    
    // Continue anyway - the PingID device is already registered
    // The COBRA/LDAP update is for record-keeping and Ping Federate attributes
    // eslint-disable-next-line no-console
    console.log('[MFA] Continuing despite COBRA error - device was already registered with PingID');
  }

  // Set user registration status to TRUE in LDAP
  // eslint-disable-next-line no-console
  console.log('[MFA] Setting isUserRegistered flag to TRUE for user:', loginAuth.userId);
  try {
    const { IsUserRegisteredService } = await import('../services/cobra/IsUserRegistered');
    const isUserRegisteredService = new IsUserRegisteredService(cobraClient);
    
    const registrationResult = await isUserRegisteredService.setUserRegistered(loginAuth.userId);
    
    if (registrationResult.success) {
      // eslint-disable-next-line no-console
      console.log('[MFA] isUserRegistered flag set to TRUE successfully');
    } else {
      // eslint-disable-next-line no-console
      console.warn('[MFA] Failed to set isUserRegistered flag:', registrationResult.message);
      // Don't fail the whole operation - device is already registered with PingID
    }
  } catch (registrationError) {
    // eslint-disable-next-line no-console
    console.error('[MFA] Error setting isUserRegistered flag:', registrationError);
    // Don't fail the whole operation - device is already registered with PingID
  }

  loginSession.needsMfaDevice = false;
  session.save();

  // eslint-disable-next-line no-console
  console.log('[MFA] MFA verification complete, user should now redirect to /done');

  return {
    success: true,
    error: null,
  };
};

export function stripNonDigits(num: string): string {
  return num.replace(/[^\d]/g, '');
}
