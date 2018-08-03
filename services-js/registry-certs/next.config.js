const path = require('path');
const withTypescript = require('@zeit/next-typescript');

module.exports = withTypescript({
  distDir: path.join('build', '.next'),
  assetPrefix:
    process.env.ASSET_HOST && process.env.ASSET_HOST !== '.'
      ? `https://${process.env.ASSET_HOST}`
      : '',

  webpack: function(config) {
    config.module.rules.push({
      test: /\.html$/,
      use: 'raw-loader',
    });

    return config;
  },
});
