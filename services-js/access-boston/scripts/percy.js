#!/usr/bin/env node

const { travisSnapshot } = require('@cityofboston/percy-common');

travisSnapshot({
  referenceBranch: 'develop',
  project: 'CityOfBoston/Access-Boston',
  packageName: 'access-boston',
  buildStorybookOptions: '-s static',
});
