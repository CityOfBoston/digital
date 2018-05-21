import { execSync } from 'child_process';

export interface TravisSnapshotOptions {
  referenceBranch: string;
  project: string;
  packageName: string;
}

const PERCY_WIDTHS = ['320', '840', '1280'];

/**
 * Takes Percy snapshots if we’re on CI and running against either a pull
 * request or the “reference” branch. This means it will not run against
 * production push branches.
 *
 * Call this from your package’s test script.
 */
export function travisSnapshot({
  referenceBranch,
  project,
  packageName,
}: TravisSnapshotOptions) {
  if (process.env['CI'] !== 'true') {
    return;
  }

  const pullRequest = process.env['TRAVIS_PULL_REQUEST'];
  const branch = process.env['TRAVIS_BRANCH'];

  const token =
    process.env[`PERCY_TOKEN_${packageName.toUpperCase().replace(/-/g, '_')}`];

  if ((pullRequest && pullRequest !== 'false') || branch === referenceBranch) {
    execSync('build-storybook', { stdio: 'inherit' });
    execSync(`percy-storybook --widths=${PERCY_WIDTHS.join(',')}`, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, {
        PERCY_PROJECT: project,
        PERCY_TOKEN: token,
      }),
    });
  } else {
    // eslint-disable-next-line no-console
    console.error(
      `Not running snapshot.js because there’s no pull request and the branch (${branch}) is not “${referenceBranch}”.`
    );
  }
}
