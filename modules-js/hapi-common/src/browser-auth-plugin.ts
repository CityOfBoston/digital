import {
  Server as HapiServer,
  Request as HapiRequest,
  Plugin,
  ServerAuthSchemeObject,
  AuthenticationData,
} from 'hapi';

import Hoek from 'hoek';
import Boom from 'boom';

export interface BrowserAuthOptions {
  /**
   * URL to redirect to if the user is not authenticated but the mode is
   * "required."
   */
  redirectTo: string;

  /**
   * If the user is authenticated, this function should return
   * AuthenticationData. If it returns null then we assume the user is not
   * authenticated.
   */
  validate: (request: HapiRequest) => AuthenticationData | null;
}

const DEFAULT_OPTIONS: BrowserAuthOptions = {
  redirectTo: '/',
  validate: () => {
    throw Boom.unauthorized();
  },
};

const browserAuthSchema = (
  _server: HapiServer,
  options: Partial<BrowserAuthOptions> | undefined
): ServerAuthSchemeObject => {
  const settings: BrowserAuthOptions = Hoek.applyToDefaults(
    DEFAULT_OPTIONS,
    options
  );

  return {
    authenticate: (req, h) => {
      const validationResults = settings.validate(req);

      if (validationResults) {
        return h.authenticated(validationResults);
      } else if (req.auth.mode === 'required') {
        return h
          .response('You are being redirected…')
          .takeover()
          .redirect(settings.redirectTo);
      } else {
        throw Boom.unauthorized(null, 'browser-auth');
      }
    },
  };
};

/**
 * Auth plugin that expects authentication to happen via browser requests.
 * Configure with a URL to redirect to in case of no login session, and a
 * validation method to check to see if the authentication is correct.
 *
 * @see BrowserAuthOptions
 */
export const browserAuthPlugin: Plugin<{}> = {
  name: 'browser-auth',
  register: (server: HapiServer) => {
    server.auth.scheme('browser', browserAuthSchema);
  },
};
