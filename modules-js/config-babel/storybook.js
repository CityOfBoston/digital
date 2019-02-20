/**
 * Configuration that’s useful for Storybook.
 *
 *  - Adds babel-plugin-require-context-hook so that Jest, when using
 *    Storyshots, can pick up all of the stories via require.context.
 *    (require.context is originally provided by Webpack)
 */
module.exports = api => ({
  plugins: [
    // Needed for using require.context in Storyshots
    ...(api.env('test') ? [require('babel-plugin-require-context-hook')] : []),
  ],
});
