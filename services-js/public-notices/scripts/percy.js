#!/usr/bin/env node

const { travisSnapshot } = require('@cityofboston/percy-common');

travisSnapshot({
  referenceBranch: 'develop',
  project: 'CityOfBoston/Public-Notices',
  packageName: 'public-notices',
  // Notices is displayed on a big TV. We don’t need to be responsive.
  widths: ['1920'],
});
