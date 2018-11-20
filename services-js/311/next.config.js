const path = require('path');
const { makeAssetPrefix, makeConfig } = require('./lib/config');
const withTypescript = require('@zeit/next-typescript');

module.exports = withTypescript(
  Object.assign(
    {
      distDir: path.join('build', '.next'),
      assetPrefix: makeAssetPrefix(),
    },
    makeConfig()
  )
);
