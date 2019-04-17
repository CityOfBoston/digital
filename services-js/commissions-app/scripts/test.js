#!/usr/bin/env node

const { travisSnapshot } = require('@cityofboston/percy-common');

// const childProcess = require('child_process');

travisSnapshot({
  referenceBranch: 'develop',
  project: 'CityOfBoston/Boards-and-Commissions',
  packageName: 'commissions-app',
});

// Pass any other args along to Jest (e.g. "--no-cache" or "-u")
// const command = ['jest', ...process.argv.slice(2)];
// childProcess.execSync(command.join(' '), { stdio: 'inherit' });
