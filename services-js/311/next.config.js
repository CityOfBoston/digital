/* eslint comma-dangle: 0, global-require: 0 */

module.exports = {
  assetPrefix:
    process.env.ASSET_HOST && process.env.ASSET_HOST !== '.'
      ? `https://${process.env.ASSET_HOST}`
      : '',

  webpack: config => {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

    // Perform customizations to config
    config.plugins.push(
      new BundleAnalyzerPlugin({
        // For all options see https://github.com/th0r/webpack-bundle-analyzer#as-plugin
        analyzerMode: 'disabled',
        analyzerHost: '127.0.0.1',
        analyzerPort: 3001,
        openAnalyzer: false,
        generateStatsFile: true,
      })
    );

    config.module.noParse = config.module.noParse || [];
    config.module.noParse.push(/mapbox-gl/);

    // Important: return the modified config
    return config;
  },
};
