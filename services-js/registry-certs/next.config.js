module.exports = {
  assetPrefix:
    process.env.CLOUDFRONT_HOST && process.env.CLOUDFRONT_HOST !== '.'
      ? `https://${process.env.CLOUDFRONT_HOST}`
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
