module.exports = function browser(_, { esm }) {
  return {
    plugins: [
      [
        require('babel-plugin-inline-import'),
        {
          extensions: ['.graphql', '.html'],
        },
      ],
      [
        require('@babel/plugin-transform-runtime'),
        {
          helpers: true,
          regenerator: true,
        },
      ],
    ],
    presets: [
      [
        require('@babel/preset-env'),
        { useBuiltIns: 'usage', modules: esm ? false : undefined },
      ],
      require('@babel/preset-react'),
    ],
  };
};
