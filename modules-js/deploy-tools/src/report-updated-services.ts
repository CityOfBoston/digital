/* eslint no-console: 0 */
require('dotenv').config();

import { URLSearchParams } from 'url';

import shell from 'shelljs';
import Project from '@lerna/project';
import PackageGraph from '@lerna/package-graph';
import { getFilteredPackages } from '@lerna/filter-options';
import fetch from 'node-fetch';

// This script runs on Travis to compare all services with their latest
// production branches to see which ones need to be re-deployed.

interface Package {
  name: string;
  location: string;
}

async function getChangedProductionServices(): Promise<string[]> {
  const serviceNameToProductionCommit = {} as { [service: string]: string };

  // Gets the commits and refs from GitHub servers, since they’re not cloned
  // locally by Travis.
  const heads = (shell.exec(`git ls-remote --heads origin "production/*"`, {
    silent: true,
  }).stdout as string)
    .trim()
    .split('\n');

  heads.forEach(h => {
    // ec717f8fc29c0f3ee2e224ceb682d57d9687fb78 refs/heads/production/commissions-app
    const match = h.match(/^([\w]*)\t.*\/production\/(.*)$/);
    if (match) {
      const commit = match[1];
      const serviceName = match[2];

      serviceNameToProductionCommit[serviceName] = commit;
    }
  });

  const updatedServiceNames = [] as string[];

  const project = new Project('./');
  const packages: Package[] = await project.getPackages();
  const graph = new PackageGraph(packages);

  const servicePackages = packages.filter(({ location }) =>
    location.match(/\/services-[\w]*\//)
  );

  await Promise.all(
    servicePackages.map(async servicePackage => {
      // This name is "<dir>.<service>"
      const { name } = servicePackage;

      const lastProductionCommit =
        serviceNameToProductionCommit[name.split('.')[1]];

      if (!lastProductionCommit) {
        return;
      }

      //  Tests to see if the service appears in the list of packages changed
      //  since the service’s last production branch.
      //
      //  Assumes that all production branches point to a commit in develop’s
      //  history. This will be true once we reset the production branches to not
      //  have merge commits from deploy PRs.
      //
      //  This may fail if a production branch hasn’t been updated in 500 commits
      //  from develop.
      const packagesChangedSince: Package[] = await getFilteredPackages(
        graph,
        { cwd: project.rootPath, maxBuffer: undefined },
        { since: lastProductionCommit }
      );

      if (packagesChangedSince.includes(servicePackage)) {
        updatedServiceNames.push(servicePackage.name.split('.')[1]);
      }
    })
  );

  return updatedServiceNames;
}

(async function() {
  let environment;
  let updatedServiceNames: string[];

  const stagingMatch = (process.env.TRAVIS_BRANCH || '').match(
    /^staging\/(.*)$/
  );

  if (stagingMatch) {
    environment = 'staging';
    updatedServiceNames = [stagingMatch[1]];
  } else {
    environment = 'production';
    updatedServiceNames = await getChangedProductionServices();
  }
  console.log(`Changed services: ${updatedServiceNames.join(' ')}`);

  if (process.env.DEPLOY_WEBHOOK_URL && updatedServiceNames.length > 0) {
    const body = new URLSearchParams({
      environment,
      commit: process.env.TRAVIS_COMMIT,
    });

    updatedServiceNames.forEach(serviceName => {
      body.append('service', serviceName);
    });

    const resp = await fetch(process.env.DEPLOY_WEBHOOK_URL, {
      method: 'POST',
      body,
      headers: {
        'X-API-KEY': process.env.DEPLOY_WEBHOOK_API_KEY || '',
      },
    });

    if (!resp.ok) {
      throw new Error(`Deploy reporting failed: ${await resp.text()}`);
    }
  }
})().catch(e => {
  console.error(e);
  process.exit(-1);
});
