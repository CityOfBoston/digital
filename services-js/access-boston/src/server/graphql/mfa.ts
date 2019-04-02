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
  { pingId, identityIq, session }
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

  await identityIq.updateUserRegistration(loginAuth.userId, {
    email: loginSession.mfaEmail || undefined,
    phoneNumber: loginSession.mfaPhoneNumber || undefined,
  });

  loginSession.needsMfaDevice = false;
  session.save();

  return {
    success: true,
    error: null,
  };
};

export function stripNonDigits(num: string): string {
  return num.replace(/[^\d]/g, '');
}
