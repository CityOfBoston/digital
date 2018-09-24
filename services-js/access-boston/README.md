# Access Boston

A web portal to point employees at enterprise applications they have access to.
Also contains the UI for change password, forgot password, and new account
setup.

## Development

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
