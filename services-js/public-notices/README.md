# Public Notices

This webapp powers a display of public notices on the 1st floor of Boston City
Hall. It’s hosted at https://apps.boston.gov/public-notices/

The data for the app comes from a JSON API provided by the Boston.gov Drupal
site.

This version is a reimplementation of the original Vue-based app from the
[CityOfBoston/notice-signage](https://github.com/CityOfBoston/notice-signage)
repo.

## Development

This is a React app that uses Next.js.

* **app:** `yarn dev`
* **tests:** `yarn test`
* **storybook:** `yarn storybook`

## Deployment / Hosting

This app uses Next.js’s [static HTML
export](https://nextjs.org/docs#static-html-export). The deployment process
uploads it to an S3 bucket. Like all apps.boston.gov S3-hosted sites, it is
served through the default handler nginx container.

### Deploys

- 2020.09.30: Security Patch - Remove hardcoded ssl pass in deploy script
- 2022.03.30: [STAGING] Debugging parsing JSON error (rollbar) 
