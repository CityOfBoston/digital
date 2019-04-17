#!/usr/bin/env node

const { travisSnapshot } = require('@cityofboston/percy-common');

travisSnapshot({
  referenceBranch: 'develop',
  project: 'CityOfBoston/react-fleet',
  packageName: 'react-fleet',
});
