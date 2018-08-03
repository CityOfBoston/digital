const path = require('path');
const withTypescript = require('@zeit/next-typescript');

module.exports = withTypescript({
  distDir: path.join('..', 'build', '.next'),
});
