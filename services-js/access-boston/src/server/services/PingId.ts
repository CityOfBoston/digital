import { of as loadProperties } from 'java-properties';
import jws from 'jws';
import fetch from 'node-fetch';

const PINGID_VERSION = '4.9';
const PINGID_LOCALE = 'en';

function makePingIdTimestamp() {
  return new Date()
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');
}

/**
 * A handful of the error IDs that Ping will return.
 *
 * @see https://www.pingidentity.com/content/developer/en/api/pingid-api/pingid-api-error-codes.html
 */
export enum ErrorId {
  OK = 200,
  USER_NOT_EXIST = 10564,
  WRONG_PASSWORD = 20513,
  INVALID_SESSION = 20517,
  INVALID_PHONE_NUMBER = 20559,
  FAILED_TO_SEND_OTP = 20558,
}

export class ApiError extends Error {
  readonly errorId: ErrorId;

  constructor(errorId: ErrorId, message: string) {
    super(message);
    this.errorId = errorId;
  }
}

interface CommonResponse {
  errorMsg: string | 'ok';
  uniqueMsgId: string;
  errorId: ErrorId;
  clientData: any;
}

type UserStatus =
  | 'ACTIVE'
  | 'NOT_ACTIVE'
  | 'PENDING_ACTIVATION'
  | 'SUSPENDED'
  | 'PENDING_CHANGE_DEVICE';

enum UserRole {
  REGULAR = 'REGULAR',
  ADMIN = 'ADMIN',
}

export interface UserDetails {
  userName: string;
  email: string | null;
  lname: string;
  userId: number;
  userInBypass: boolean;
  userEnabled: boolean;
  fname: string;
  picURL: string;
  spList: [];
  lastLogin: number | null;
  bypassExpiration: null;
  deviceDetails: Object | null;
  lastTransactions: [];
  devicesDetails: [];
  status: UserStatus;
  role: UserRole;
}

interface UserDetailsResponseBody extends CommonResponse {
  userDetails: UserDetails;
  sameDeviceUsersDetails: [];
}

interface AddUserResponseBody extends CommonResponse {
  activationCode: string;
  userDetails: UserDetails;
}

interface StartPairingResponseBody extends CommonResponse {
  sessionId: string;
}

interface FinalizePairingResponseBody extends CommonResponse {}

interface JwsResponse {
  header: {};
  /** This is a JSON-encoded object of type JwsPayload. */
  payload: string;
}

type JwsPayload<T> = {
  responseBody: T;
};

/**
 * How the OTP should be sent for device pairing. These values directly match
 * the Ping API’s expected input.
 */
export enum VerificationType {
  SMS = 'SMS',
  VOICE = 'VOICE',
  EMAIL = 'EMAIL',
}

export interface PingIdOptions {
  endpoint: string;
  jwsKey: Buffer;
  token: string;
  orgAlias: string;
}

export interface AddUserArgs {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Service class for connecting to the PingID API.
 *
 * PingID is used to manage the multi-factor auth parts of the IAM project. The
 * Access Boston portal uses it to set up a user’s initial MFA device.
 */
export default class PingId {
  private endpoint: string;
  private jwsKey: Buffer;
  private token: string;
  private orgAlias: string;

  constructor({ endpoint, jwsKey, token, orgAlias }: PingIdOptions) {
    this.endpoint = endpoint;
    this.jwsKey = jwsKey;
    this.token = token;
    this.orgAlias = orgAlias;
  }

  /**
   * Internal method to make a JWS-signed request to Ping’s API. Returns the
   * decoded-and-parsed responseBody.
   *
   * @throws ApiError on non-200 responses
   *
   * @see
   * https://www.pingidentity.com/content/developer/en/api/pingid-api.html#using_the_api
   */
  private async makeRequest<T extends CommonResponse>(
    path: string,
    body: Object
  ): Promise<T> {
    const header = {
      alg: 'HS256',
      org_alias: this.orgAlias,
      token: this.token,
    };

    const payload = {
      reqHeader: {
        orgAlias: this.orgAlias,
        secretKey: this.token,
        timestamp: makePingIdTimestamp(),
        version: PINGID_VERSION,
        locale: PINGID_LOCALE,
      },
      reqBody: body,
    };

    const signedBody = jws.sign({
      header,
      payload,
      secret: this.jwsKey,
    });
    const url = `${this.endpoint}/rest/4/${path}/do`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signedBody, 'UTF-8').toString(),
      },
      body: signedBody,
    });

    if (resp.ok) {
      const decoded: JwsResponse = jws.decode(await resp.text());
      const payload: JwsPayload<T> = JSON.parse(decoded.payload);
      return payload.responseBody;
    } else {
      const responseText = await resp.text();

      // Sometimes we get a raw JSON response, sometimes we get one that’s
      // JWS-encoded. No, headers don’t tell us when it’s one or the other, so
      // we peek at the first char in order to guess. :-P
      if (responseText.startsWith('{')) {
        const { responseBody } = JSON.parse(responseText);

        throw new ApiError(responseBody.errorId, responseBody.errorMsg);
      } else {
        const decoded: JwsResponse = jws.decode(responseText);
        const payload: JwsPayload<CommonResponse> = JSON.parse(decoded.payload);

        // eslint-disable-next-line no-console
        console.error(payload.responseBody);

        throw new ApiError(
          payload.responseBody.errorId,
          payload.responseBody.errorMsg
        );
      }
    }
  }

  /**
   * Adds a new user to PingID. Before a user is registered they can exist in
   * IdentityIQ but not in Ping.
   *
   * Will throw an exception if the user is already in Ping, so call
   * getUserDetails first.
   */
  async addUser({
    userId,
    firstName,
    lastName,
    email,
  }: AddUserArgs): Promise<UserDetails> {
    return (await this.makeRequest<AddUserResponseBody>('adduser', {
      activateUser: true,
      username: userId,
      fName: firstName,
      lname: lastName,
      role: UserRole.REGULAR,
      email,
    })).userDetails;
  }

  /**
   * Loads a user by its ID. Returns null if the user was not found.
   */
  async getUserDetails(userId: string): Promise<UserDetails | null> {
    try {
      return (await this.makeRequest<UserDetailsResponseBody>(
        'getuserdetails',
        {
          getSameDeviceUsers: false,
          userName: userId,
        }
      )).userDetails;
    } catch (e) {
      if (e instanceof ApiError && e.errorId === ErrorId.USER_NOT_EXIST) {
        return null;
      } else {
        throw e;
      }
    }
  }

  /**
   * Starts the MFA pairing process for a phone number or email address. Calling
   * this method will cause Ping to send an email, SMS, or make a phone call.
   *
   * @returns The sessionId that will be used for finalizePairing.
   */
  async startPairing(
    userId: string,
    type: VerificationType,
    phoneOrEmail: string
  ): Promise<string> {
    return (await this.makeRequest<StartPairingResponseBody>(
      'startofflinepairing',
      {
        username: userId,
        type,
        pairingData: phoneOrEmail,
      }
    )).sessionId;
  }

  /**
   * Completes the pairing for the given session ID with the given one-time
   * password.
   *
   * Returns "true" in case of success. If the OTP is not correct, will return
   * the WRONG_PASSWORD error ID.
   *
   * Other server errors will throw (such as invalid session ID) since they’re
   * not recoverable in the same way that a wrong password is.
   */
  async finalizePairing(
    sessionId: string,
    otp: string
  ): Promise<true | ErrorId.WRONG_PASSWORD> {
    try {
      await this.makeRequest<FinalizePairingResponseBody>(
        'finalizeofflinepairing',
        { sessionId, otp }
      );

      return true;
    } catch (e) {
      if (e instanceof ApiError && e.errorId === ErrorId.WRONG_PASSWORD) {
        return ErrorId.WRONG_PASSWORD;
      } else {
        throw e;
      }
    }
  }
}

/**
 * Keys for the data in the pingid.properties file.
 */
const PROPS_KEYS = {
  useBase64Key: 'use_base64_key',
  useSignature: 'use_signature',
  token: 'token',
  idpUrl: 'idp_url',
  orgAlias: 'org_alias',
  adminUrl: 'admin_url',
  authenticatorUrl: 'authenticator_url',
};

/**
 * Makes a PingId object from the pingid.properties configuration file that’s
 * exported from Ping.
 */
export async function pingIdFromProperties(
  propertiesFileName: string
): Promise<PingId> {
  const props = loadProperties(propertiesFileName);

  const endpoint = props.get(PROPS_KEYS.idpUrl);
  const jwsKey = Buffer.from(props.get(PROPS_KEYS.useBase64Key), 'base64');
  const token = props.get(PROPS_KEYS.token);
  const orgAlias = props.get(PROPS_KEYS.orgAlias);

  return new PingId({ endpoint, jwsKey, token, orgAlias });
}
