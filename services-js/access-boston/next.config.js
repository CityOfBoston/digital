const path = require('path');
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

module.exports = withPolyfill({
  distDir: path.join('..', 'build', '.next'),
  env: {
    GROUP_MANAGEMENT_API_URL: process.env.GROUP_MANAGEMENT_API_URL,
  },
});
