const path = require('path');
const withTypescript = require('@zeit/next-typescript');
const withSourceMaps = require('@zeit/next-source-maps')();
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

module.exports = withTypescript(
  withSourceMaps(
    withPolyfill({
      distDir: path.join('build', '.next'),
      webpack: function(config) {
        config.module.rules.push({
          test: /\.html$/,
          use: 'raw-loader',
        });

        return config;
      },
    })
  )
);
