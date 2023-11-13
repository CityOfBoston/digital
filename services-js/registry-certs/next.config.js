const path = require('path');
const withPolyfill = require('@cityofboston/next-client-common/with-polyfill')();

module.exports = withPolyfill({
  distDir: path.join('..', 'build', '.next'),
});

// const withSourceMaps = require('@zeit/next-source-maps')();
// module.exports = withSourceMaps(
//   withPolyfill({
//     distDir: path.join('build', '.next'),
//     webpack: function(config) {
//       config.module.rules.push({
//         test: /\.html$/,
//         use: 'raw-loader',
//       });

//       return config;
//     },
//   })
// );
