export { CenterWrapper, NarrowWrapper } from './wrappers';

export function storybookOptions(projectName) {
  return {
    options: {
      name: projectName,
      hierarchySeparator: /\/|\./,
      hierarchyRootSeparator: '|',
      sortStoriesByKind: true,
    },
  };
}

type WebpackConfig = any;

// 'PRODUCTION' is used when building the static version of storybook.
type Mode = 'DEVELOPMENT' | 'PRODUCTION';

export function webpackConfig(
  config: WebpackConfig,
  _mode?: Mode
): WebpackConfig {
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

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
}

type WebpackContextModule = any;

/**
 * Helper function to load all of a project’s Stories.
 *
 * Most projects will define req in their `config.js` like this:
 * const req = require.context('../src', true, /\.stories\.(jsx?|tsx?)$/);
 *
 * In the case of needing to specify more than one discrete directory,
 * you may pass multiple `req`s in as arguments to this function.
 */
export function loadStories(...args: WebpackContextModule[]): void {
  args.forEach(req => req.keys().forEach(filename => req(filename)));
}
