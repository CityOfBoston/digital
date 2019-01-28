# Access Boston

A web portal to point employees at enterprise applications they have access to.
Also contains the UI for change password, forgot password, and new account
setup.

## Development

### Test authentication

By default, the dev server does not attempt to use real SAML for authentication.
(You can change this by setting `SAML_IN_DEV=true` in `.env`) You can log in
with any user ID through the fake login form.

**SPECIAL VALUES**

 * Log in with an account ID that starts with "NEW" to get to the registration
   flow (See `SamlAuthFake.ts`)
 * Try to use "wrong-password" as your existing password to get a password
   creation failure. (See `IdentityIqFake.ts`) 

### TestCafe

This service has [TestCafé](http://devexpress.github.io/testcafe/) tests to
validate important integrations and login behavior.

These run with a headless Chrome browser as part of the `test` script. These
tests are run against a pre-compiled Next.js app with no environment variables
set (beyond `NODE_ENV=testcafe`).

To debug the tests, start your dev server with `yarn dev` and then run `yarn
testcafe:dev` in another terminal window. You will need to comment out lines
in `.env` that configure external SAML or IdentityIq services. (You could also
run with `NODE_ENV` set to `testcafe` but you’ll need to pre-compile with `yarn
build` since `testcafe` doesn’t run Next in watch mode.)

When `testcafe:dev` is running, go to the URL it prints out using your favorite
browser.

_Note:_ The TestCafe `integrations` tests are excluded from `tsconfig.json` so
that their definitions of `test` don’t conflict with Jest’s. The `testcafe`
binary does not use `tsconfig.json`, so this doesn’t affect running the tests.


## Deployment

### Generating metadata

The Ping identity provider needs us to generate a metadata file in order to
register as a service provider. We need two, actually: one for the normal app
and one for the forgot password flow (this is because they have separate MFA
requirements).

We also need to generate keys.

 1) `../../scripts/generate-ssl-key.sh . service-provider`
 1) `../../scripts/generate-ssl-key.sh . service-provider-forgot`
 1) In .env:
   * Set `SAML_IN_DEV=true`
   * Set `PUBLIC_HOST` to the user-visible hostname (_e.g._ `access-boston-dev.digital-staging.boston.gov`)
 1) `yarn dev`
 1) Download `http://localhost:3000/metadata.xml` and
    `http://localhost:3000/metadata-forgot.xml` and send them to the IAM team.