import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import Head from 'next/head';
import { setConfig } from 'next/config';
import { createRouter } from 'next/router';

import HeadManager from 'next/dist/client/head-manager';
import { addParameters, configure, addDecorator } from '@storybook/react';

import { loadStories, storybookOptions } from '@cityofboston/storybook-common';

import styleTags from '../client/common/utility/style-tags';

import './addons';

const headManager = new HeadManager();

const router =
  process.env.NODE_ENV === 'test' ? null : createRouter('/', null, null);

class Wrapper extends React.Component {
  getChildContext() {
    return {
      headManager: this.props.headManager,
      router,
    };
  }

  render() {
    return (
      <div>
        {/* no stylesheets because they come in preview-head.html */}
        <Head>{styleTags({ noStylesheets: true })}</Head>

        {this.props.children}
      </div>
    );
  }
}

Wrapper.propTypes = {
  headManager: PropTypes.any,
  children: PropTypes.any,
};

Wrapper.childContextTypes = {
  headManager: PropTypes.object,
  router: PropTypes.object,
};

const clientStoriesContext = require.context(
  '../client',
  true,
  /.stories\.(jsx?|tsx?)$/
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
    // eslint-disable-next-line no-underscore-dangle
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ =
      window.parent.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }

  return <Wrapper headManager={headManager}>{story()}</Wrapper>;
});

configure(
  () => loadStories(clientStoriesContext, serverStoriesContext),
  module
);
