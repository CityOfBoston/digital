#!/usr/bin/env node

const { travisSnapshot } = require('@cityofboston/percy-common');

const childProcess = require('child_process');

travisSnapshot({
  referenceBranch: 'develop',
  project: 'CityOfBoston/Public-Notices',
  packageName: 'public-notices',
  // Notices is displayed on a big TV. We don’t need to be responsive.
  widths: ['1920'],
});

// Pass any other args along to Jest (e.g. "--no-cache" or "-u")
const command = ['jest', ...process.argv.slice(2)];
childProcess.execSync(command.join(' '), { stdio: 'inherit' });
