module.exports = function react(_, { esm }) {
  return {
    plugins: [
      [
        require('@babel/plugin-transform-runtime'),
        {
          helpers: false,
          polyfill: false,
          regenerator: true,
        },
      ],
      [
        require('babel-plugin-inline-import'),
        {
          extensions: ['.graphql', '.html'],
        },
      ],
    ],
    presets: [
      [require('@babel/preset-env'), { modules: esm ? false : undefined }],
      require('@babel/preset-react'),
    ],
  };
};
