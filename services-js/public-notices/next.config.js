require('dotenv').config();

const path = require('path');
const withSourceMaps = require('@zeit/next-source-maps')();
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

module.exports = withSourceMaps(
  withPolyfill({
    distDir: path.join('..', 'build', '.next'),
    assetPrefix: process.env.ASSET_PREFIX || '/',
    publicRuntimeConfig: {
      noticesApiUrl:
        process.env.NOTICES_API_URL ||
        'https://www.boston.gov/api/v2/public-notices',
      rollbarAccessToken: process.env.ROLLBAR_BROWSER_ACCESS_TOKEN,
      rollbarEnvironment:
        process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
    },
  })
);
