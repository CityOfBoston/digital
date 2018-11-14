/* eslint no-console: 0 */

// Runs the Storybook snapshot and sends the results to Percy.
//
// Only runs in Travis cases we care about so we don't send too much to Percy.

import shell from 'shelljs';

if (
  (process.env['TRAVIS_PULL_REQUEST'] &&
    process.env['TRAVIS_PULL_REQUEST'] !== 'false') ||
  process.env['TRAVIS_BRANCH'] === 'production'
) {
  if (shell.exec('gulp storybook:head').code !== 0) {
    shell.echo('Error: gulp storybook:head failed');
    shell.exit(1);
  }

  if (shell.exec('build-storybook -s static -c storybook').code !== 0) {
    shell.echo('Error: build-storybook failed');
    shell.exit(1);
  }

  if (shell.exec('percy-storybook --widths=320,840,1280').code !== 0) {
    shell.echo('Error: percy-storybook failed');
    shell.exit(1);
  }
} else {
  console.log(
    `Not running snapshot.js because there’s no pull request and the branch (${process
      .env['TRAVIS_BRANCH']}) is not “production”.`
  );
}
