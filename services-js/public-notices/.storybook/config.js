import { configure, getStorybook, setAddon } from '@storybook/react';
import createPercyAddon from '@percy-io/percy-storybook';

import './addons';

const { percyAddon, serializeStories } = createPercyAddon();
setAddon(percyAddon);

const req = require.context('../src', true, /\.stories\.(jsx?|tsx?)$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

serializeStories(getStorybook);
