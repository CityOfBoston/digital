import { MutationResolvers } from './schema';
import Boom from 'boom';
import { ErrorId as PingErrorId } from '../services/PingId';

export enum MfaError {
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
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
    throw Boom.forbidden();
  }

  const { userId } = loginAuth;
  const { firstName, lastName, email: registeredEmail } = loginSession;

  let pingUser = await pingId.getUserDetails(userId);

  if (!pingUser) {
    await pingId.addUser({
      userId,
      firstName,
      lastName,
      email: registeredEmail,
    });
  }

  // TODO(finh): validate email and phone number formats

  let phoneOrEmail: string;
  switch (type) {
    case 'EMAIL':
      if (email) {
        phoneOrEmail = email;
      } else {
        throw new Error('Missing email address for EMAIL verification type');
      }
      break;

    case 'VOICE':
    case 'SMS':
      if (phoneNumber) {
        phoneOrEmail = phoneNumber;
      } else {
        throw new Error(`Missing phone number for ${type} verification type`);
      }
      break;

    default:
      throw new Error(`Unknown verification type: ${type}`);
  }

  const sessionId = await pingId.startPairing(userId, type, phoneOrEmail);

  return {
    sessionId,
    error: null,
  };
};

export const verifyMfaDeviceMutation: MutationResolvers['verifyMfaDevice'] = async (
  _root,
  { sessionId, pairingCode },
  { pingId, session: { loginAuth } }
) => {
  // This is not strictly necessary, since the PingID pairing session ID is
  // enough to validate the user, but it doesn’t really hurt to enforce the
  // login.
  if (!loginAuth) {
    throw Boom.forbidden();
  }

  const result = await pingId.finalizePairing(sessionId, pairingCode);

  return {
    success: result === true ? true : false,
    error:
      result === PingErrorId.WRONG_PASSWORD ? MfaError.WRONG_PASSWORD : null,
  };
};
