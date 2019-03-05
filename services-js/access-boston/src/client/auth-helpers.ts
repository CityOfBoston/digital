import { Account } from './graphql/fetch-account';

/**
 * Throw this type of error out of getInitialProps to have the App component do
 * a redirect rather than render the page. Works both client- and server-side.
 */
export class RedirectError extends Error {
  url: string;

  constructor(url: string) {
    super();

    this.url = url;
  }
}

/**
 * Ensures that the account has been registered. If not, throws a
 * a RedirectError to the registration flow.
 *
 * Expected to be called from getInitialProps in page components.
 */
export function requireRegistration(account: Account) {
  if (account.needsMfaDevice || account.needsNewPassword) {
    throw new RedirectError('/register');
  }
}
