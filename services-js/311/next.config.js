const path = require('path');
const { makeAssetPrefix, makeConfig } = require('./lib/config');
const withTypescript = require('@zeit/next-typescript');

module.exports = withTypescript(
  Object.assign(
    {
      distDir: path.join('build', '.next'),
      assetPrefix: makeAssetPrefix(),

      webpack: config => {
        config.module.noParse = config.module.noParse || [];
        config.module.noParse.push(/mapbox-gl/);

        // Important: return the modified config
        return config;
      },
    },
    makeConfig()
  )
);
