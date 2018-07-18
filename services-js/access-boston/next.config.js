const path = require('path');
const withTypescript = require('@zeit/next-typescript');

module.exports = withTypescript({
  distDir: path.join('..', 'build', '.next'),

  webpack: config => {
    // NextJS’s default Uglify options don’t remove unused code, which means
    // that we don’t get tree-shaking benefits with Webpack 3. This adds that
    // back in.
    config.plugins.forEach(plugin => {
      if (
        plugin &&
        plugin.constructor &&
        plugin.constructor.name === 'UglifyJsPlugin'
      ) {
        plugin.options.uglifyOptions.compress.unused = true;
      }
    });

    return config;
  },
});
