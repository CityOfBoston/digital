const path = require('path');
const withTypescript = require('@zeit/next-typescript');
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

function makeAssetPrefix(env) {
  env = env || process.env;

  return env.ASSET_HOST && env.ASSET_HOST !== '.'
    ? `https://${env.ASSET_HOST}`
    : '';
}

module.exports = withTypescript(
  withPolyfill({
    distDir: path.join('build', '.next'),
    assetPrefix: makeAssetPrefix(),
  })
);
