import { configure, addDecorator, addParameters } from '@storybook/react';
import { setConfig } from 'next/config';
import { loadStories, storybookOptions } from '@cityofboston/storybook-common';
import './addons';

const clientStoriesContext = require.context(
  '../client',
  true,
  /\.stories\.(jsx?|tsx?)$/
);

const serverStoriesContext = require.context(
  '../server',
  true,
  /.stories\.(jsx?|tsx?)$/
);

addParameters(storybookOptions('registry-certs'));

addDecorator(story => {
  setConfig({
    publicRuntimeConfig: {
      stripePublishableKey: 'test-key',
    },
    serverRuntimeConfig: {},
  });

  if (window.parent) {
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ =
      window.parent.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }

  return story();
});

configure(
  () => loadStories(clientStoriesContext, serverStoriesContext),
  module
);
