/* eslint comma-dangle: 0, global-require: 0 */

module.exports = {
  webpack: (config) => {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

    // Perform customizations to config
    if (process.env.NODE_ENV !== 'test') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          // For all options see https://github.com/th0r/webpack-bundle-analyzer#as-plugin
          analyzerMode: 'disabled',
          analyzerHost: '127.0.0.1',
          analyzerPort: 3001,
          openAnalyzer: false,
          generateStatsFile: true
        })
      );
    }

    // Important: return the modified config
    return config;
  },
};
