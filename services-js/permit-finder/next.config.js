const path = require('path');
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

module.exports = withPolyfill({
  distDir: path.join('..', 'build', '.next'),
});
