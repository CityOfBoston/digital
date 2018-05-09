/* eslint no-console: 0 */
/**
 * @file Creates a package.json file that only includes a subset of the
 * workspaces, so that `yarn install` in a Dockerfile doesn’t install the world.
 *
 * This script should have no dependencies outside of core Node, since it’s run
 * without doing any package installs (by definition).
 */

const { exec } = require('child_process');
const fs = require('fs');

const workspaceNameQueue = process.argv.slice(2);

const filteredPackages = [];

exec('yarn --silent workspaces info', (err, stdout) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const workspacesInfo = JSON.parse(stdout);

  while (workspaceNameQueue.length) {
    const workspaceName = workspaceNameQueue.pop();
    const workspaceInfo = workspacesInfo[workspaceName];

    if (!filteredPackages.includes(workspaceInfo.location)) {
      filteredPackages.push(workspaceInfo.location);
      workspaceNameQueue.push.apply(
        workspaceNameQueue,
        workspaceInfo.workspaceDependencies
      );
    }
  }

  console.error('Filtering workspace packages to: ', filteredPackages);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

  if (Array.isArray(packageJson.workspaces)) {
    packageJson.workspaces = filteredPackages;
  } else {
    packageJson.workspaces.packages = filteredPackages;
  }

  console.log(JSON.stringify(packageJson, null, 2));
});
