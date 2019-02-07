/**
 * Babel preset to bring in next/babel and set its polyfill policy to "usage".
 * This will automatically include any polyfills we use in our compiled code
 * (though *not* node_modules) for things like ES6 Array methods that we keep
 * forgetting that IE11 doesn’t have.
 */
module.exports = api => ({
  presets: [
    [
      require('next/babel'),
      {
        'preset-env': {
          useBuiltIns: 'usage',
          // We prefer using TypeScript’s ES6 imports for Webpack /
          // tree-shaking, but for Jest we need commonjs require() statements.
          // ("auto" isn’t sufficient because it doesn’t transform .tsx files to
          // use commonjs in test mode.). We still use 'auto' by default,
          // though, so that babel converts to commonjs for babel-node,
          // regardless of NODE_ENV. (babel-node is used in e.g. 311’s gulpfile)
          modules: api.env('test') ? 'commonjs' : 'auto',
        },
      },
    ],
  ],
  plugins: [
    [require('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require('@babel/plugin-proposal-class-properties'), { loose: true }],
    // Needed for using require.context in Storyshots
    ...(api.env('test') ? [require('babel-plugin-require-context-hook')] : []),
  ],
});
