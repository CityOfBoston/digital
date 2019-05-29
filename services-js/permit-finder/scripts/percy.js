#!/usr/bin/env node

const { travisSnapshot } = require('@cityofboston/percy-common');

travisSnapshot({
  referenceBranch: 'develop',
  project: 'CityOfBoston/permit-finder',
  packageName: 'permit-finder',
  buildStorybookOptions: '-s static',
});
