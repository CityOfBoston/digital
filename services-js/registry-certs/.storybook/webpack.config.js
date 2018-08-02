/**
 * Customizes Storybook’s Webpack configuration to include TypeScript file
 * exensions.
 */
module.exports = (baseConfig, env, config) => {
  // Finds the rule that matches a JS file and makes it match TypeScript as
  // well. This lets us automatically use whatever Babel config Storybook has
  // set up.
  config.module.rules.forEach(rule => {
    if (rule.test.test('example.js')) {
      rule.test = /\.(j|t)sx?$/;
    }
  });

  config.module.rules.push({
    test: /\.html$/,
    use: 'raw-loader',
  });

  config.module.rules.push({
    test: /\.snap$/,
    use: 'raw-loader',
  });

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
