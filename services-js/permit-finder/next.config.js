const path = require('path');
const withTypescript = require('@zeit/next-typescript');
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

module.exports = withTypescript(
  withPolyfill({
    distDir: path.join('..', 'build', '.next'),
  })
);
