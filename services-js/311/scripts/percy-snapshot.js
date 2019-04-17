#!/usr/bin/env node

const { travisSnapshot } = require('@cityofboston/percy-common');

travisSnapshot({
  referenceBranch: 'develop',
  project: 'CityOfBoston/311',
  packageName: '311',
  buildStorybookOptions: '-s static',
});
