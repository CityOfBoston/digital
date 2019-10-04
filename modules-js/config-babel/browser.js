/**
 * Babel preset for libraries that will run in the browser, but aren’t
 * explicitly using the NextJS preset. Does include `@babel/preset-react`
 * however.
 *
 * Automatically imports core-js polyfills by specifying `'usage'` to
 * `@babel/preset-env`. Uses `@babel/plugin-transform-runtime` so that runtime
 * support is `require`d in, keeping us from duplicating it in applications that
 * import this package.
 *
 * If this is run with BABEL_ENV=esm, generates ES modules. This is important
 * for making packages that can be tree-shook by Webpack.
 */
module.exports = api => ({
  presets: [
    [
      require('@babel/preset-env'),
      {
        useBuiltIns: 'usage',
        corejs: 2,
        modules: api.env('esm') ? false : undefined,
      },
    ],
    require('@babel/preset-react'),
  ],
  plugins: [
    [
      require('@babel/plugin-transform-runtime'),
      {
        helpers: true,
        regenerator: true,
      },
    ],
  ],
});
