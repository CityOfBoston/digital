import {
  configure,
  getStorybook,
  setAddon,
  addDecorator,
} from '@storybook/react';
import createPercyAddon from '@percy-io/percy-storybook';
import { setConfig } from 'next/config';

import './addons';

const { percyAddon, serializeStories } = createPercyAddon();
setAddon(percyAddon);

const req = require.context('../src', true, /\.stories\.(jsx?|tsx?)$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addDecorator(story => {
  setConfig({
    publicRuntimeConfig: {},
    serverRuntimeConfig: {},
  });

  return story();
});

configure(loadStories, module);

serializeStories(getStorybook);
