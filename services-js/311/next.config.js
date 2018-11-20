const path = require('path');
const withTypescript = require('@zeit/next-typescript');

function makeAssetPrefix(env) {
  env = env || process.env;

  return env.ASSET_HOST && env.ASSET_HOST !== '.'
    ? `https://${env.ASSET_HOST}`
    : '';
}

module.exports = withTypescript({
  distDir: path.join('build', '.next'),
  assetPrefix: makeAssetPrefix(),
});
