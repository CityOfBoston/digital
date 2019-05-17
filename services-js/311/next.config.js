const path = require('path');
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

function makeAssetPrefix(env) {
  env = env || process.env;

  return env.ASSET_HOST && env.ASSET_HOST !== '.'
    ? `https://${env.ASSET_HOST}`
    : '';
}

module.exports = withPolyfill({
  distDir: path.join('build', '.next'),
  assetPrefix: makeAssetPrefix(),
});
