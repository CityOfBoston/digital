const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.snap$/,
        loaders: ['babel-loader'],
        include: path.resolve(__dirname, '../'),
      },
    ],
  },
};
