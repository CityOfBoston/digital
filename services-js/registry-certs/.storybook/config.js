import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import Head from 'next/head';
import { createRouter } from 'next/router';
import createPercyAddon from '@percy-io/percy-storybook';

import HeadManager from 'next/dist/client/head-manager';
import {
  configure,
  addDecorator,
  getStorybook,
  setAddon,
} from '@storybook/react';

import styleTags from '../client/common/style-tags';

import './addons';

const { percyAddon, serializeStories } = createPercyAddon();
setAddon(percyAddon);

const headManager = new HeadManager();

const router =
  process.env.NODE_ENV === 'test' ? null : createRouter('/', null, null);

const DEFAULT_STYLE = `
  body, html {
    background-color: #eee;
  }
`;

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
        <Head>{styleTags(DEFAULT_STYLE)}</Head>

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

function loadStories() {
  clientStoriesContext
    .keys()
    .forEach(filename => clientStoriesContext(filename));
  serverStoriesContext
    .keys()
    .forEach(filename => serverStoriesContext(filename));
}

addDecorator(story => {
  if (window.parent) {
    // eslint-disable-next-line no-underscore-dangle
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ =
      window.parent.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }

  return <Wrapper headManager={headManager}>{story()}</Wrapper>;
});

configure(loadStories, module);

serializeStories(getStorybook);
