// @flow
/* eslint global-require: 0 */

import makeConfig, { makeAssetPrefix } from './lib/config';

const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');

module.exports = withBundleAnalyzer({
  assetPrefix: makeAssetPrefix(),

  ...makeConfig(),

  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'static',
      reportFilename: '../../build/server.html',
    },
    browser: {
      analyzerMode: 'static',
      reportFilename: '../build/client.html',
    },
  },
  webpack: config => {
    config.module.noParse = config.module.noParse || [];
    config.module.noParse.push(/mapbox-gl/);

    // Important: return the modified config
    return config;
  },
});
