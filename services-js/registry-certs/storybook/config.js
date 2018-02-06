import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { createRouter } from 'next/router';
import '@storybook/addon-actions/register';

import HeadManager from 'next/dist/client/head-manager';
import { configure, addDecorator } from '@storybook/react';

import styleTags from '../client/common/style-tags';

const headManager = new HeadManager();

const router =
  process.env.NODE_ENV === 'test' ? null : createRouter('/', null, null);

const DEFAULT_STYLE = `
  body, html {
    background-color: #eee;
  }
`;

class Wrapper extends React.Component {
  static propTypes = {
    headManager: PropTypes.any,
    children: PropTypes.any,
  };

  static childContextTypes = {
    headManager: PropTypes.object,
    router: PropTypes.object,
  };

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

// Mock out Jest so we can import tests into storybook for their dummy data
global.jest = {
  mock: () => {},
  fn: () => {},
};
global.test = () => {};
global.it = () => {};
global.beforeEach = () => {};
global.afterEach = () => {};
global.describe = () => {};

const clientStoriesContext = require.context('../client', true, /.stories.js$/);
const serverStoriesContext = require.context('../server', true, /.stories.js$/);

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

if (typeof window === 'object') {
  window.__storybook_stories__ = require('@storybook/react').getStorybook();
}
