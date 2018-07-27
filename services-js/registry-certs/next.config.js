module.exports = {
  assetPrefix:
    process.env.ASSET_HOST && process.env.ASSET_HOST !== '.'
      ? `https://${process.env.ASSET_HOST}`
      : '',
  webpack: config => {
    // Perform customizations to config
    if (process.env.NODE_ENV === 'development') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
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
    }

    // Important: return the modified config
    return config;
  },
};
