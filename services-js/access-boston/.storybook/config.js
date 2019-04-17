import { configure, addDecorator, addParameters } from '@storybook/react';
import { setConfig } from 'next/config';

import { loadStories, storybookOptions } from '@cityofboston/storybook-common';

import './addons';

const req = require.context('../src', true, /\.stories\.(jsx?|tsx?)$/);

addDecorator(story => {
  setConfig({
    publicRuntimeConfig: {},
    serverRuntimeConfig: {},
  });

  return story();
});

addParameters(storybookOptions('access-boston'));

configure(() => loadStories(req), module);
