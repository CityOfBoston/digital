# Access Boston

A web portal to point employees at enterprise applications they have access to.
Also contains the UI for change password, forgot password, and new account
setup.

## Development

### Adding a new application to the portal
[./fixtures/apps.yaml](./fixtures/apps.yaml) provides documentation of the portal configuration, and should be updated to mirror what is in ECS.

1. update `dev` and `test` on AppsStaging ([guide](https://app.gitbook.com/@boston/s/digital/guides/amazon-web-services/service-configuration/editing-a-projects-.env-using-cyberduck))
2. restart the service ([guide](https://app.gitbook.com/@boston/s/digital/guides/amazon-web-services/service-configuration/restarting-an-ecs-service))
3. once the restart is complete and the `service access-boston has reached a steady state.` event occurs, go ahead and update the config on AppsProd.


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

## Staging

Unlike other projects in the digital repo, there are **two** staging instances
that can be pushed to, “dev” and “test”. Pushing a branch to staging looks like
this:

```
$ git push --force --no-verify origin HEAD:staging/access-boston@dev
```
https://access-boston-dev.digital-staging.boston.gov/

or
```
$ git push --force --no-verify origin HEAD:staging/access-boston@test
```
https://access-boston-test.digital-staging.boston.gov/

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


## URLs

### Localhost
http://localhost:3000/

### Staging
DEV: https://access-boston-dev.digital-staging.boston.gov/
TEST: http://access-test.boston.gov/ | https://access-boston-test.digital-staging.boston.gov/

### PROD
https://access-boston.boston.gov/

### Tech Debt:
- 2021.10.22: Bumping node, next, typescript, etc module up
  - Removing the following files, TODO: Resolve issues later
    - services-js/access-boston/src/client/group-management/ConfirmationView.stories.tsx
    - services-js/access-boston/src/client/group-management/ReviewChangesView.stories.tsx

### Deploys

- 2020.05.27: New App entry, PHIRE
- 2020.07.10: Adding group to Building Maintenance Form Link
- 2020.07.14: Reverting Building Maintenance new group
- 2020.07.14: Test empty deploy, checking if failed deploy is related to expired build start
- 2020.08.04: New App Deploy (PROD) - RISKMASTER
- 2020.08.07: New App Deploy (PROD) - XYBION
- 2020.08.24: New App Deploy (PROD) - Gov QA
- 2020.08.24: App Deploy (PROD) - Gov QA, Group Name Fix (All Uppercase)
- 2020.08.28: Issue 602 Test
- 2021.03.09: Testing Security Patch and upgrades to Node version usuage
- 2021.03.26: Post Security Patch test deploys
- 2021.03.29: PROD deploy - ScerIS tile
- 2021.03.29: PROD deploy - ScerIS tile 2nd try
- 2021.03.29: PROD deploy - ScerIS tile 3rd try
- 2021.04.14: PROD deploy - Boston Gives Back (United Way)
- 2021.04.15: PROD deploy - ScerIS tile fix, uppercase groups
- 2021.05.20: PROD deploy - BAIS FN Tile link update
- 2021.05.20: PROD deploy - BAIS FN Tile link update, second attempt
- 2021.08.26: PROD deploy - ServiceNow (new dashboard App)
- 2021.08.30: PROD deploy - Covid Compliance
- 2021.09.20: PROD deploy - Hyperion, update app URL
- 2021.10.29: PROD deploy - V3 tile
- 2021.11.23: PROD deploy - Update IIQ URL
- 2021.12.13: PROD deploy - Beacon tile and ServiceNow Rebranding
- 2022.02.26: PROD deploy - Remove 'Boston Gives Back' icon/link from Dashboard
- 2022.02.28: PROD deploy - New Tile, CyberArk
- 2022.08.11: PROD deploy - Push-through Docker Image Sizing Fix
