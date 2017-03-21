import React, { PropTypes } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import HeadManager from 'next/dist/client/head-manager';
import { configure, addDecorator } from '@kadira/storybook';

// eslint-disable-next-line import/extensions
import DOT_ENV from '../.env';
import makeCss from '../lib/make-css';
import parseDotEnv from '../lib/test/parse-dot-env';

const dotEnv = parseDotEnv(DOT_ENV);
const headManager = new HeadManager();

class Wrapper extends React.Component {
  static childContextTypes = {
    headManager: PropTypes.object,
    router: PropTypes.object,
  }

  constructor() {
    super();

    if (window.parent) {
      // eslint-disable-next-line no-underscore-dangle
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = window.parent.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    }

    window.API_KEYS = {
      google: dotEnv.GOOGLE_API_KEY,
    };
  }

  getChildContext() {
    return {
      headManager: this.props.headManager,
      router: Router,
    };
  }

  render() {
    return (
      <div>
        <Head>
          <base href="http://localhost:3000" />
          { makeCss() }
        </Head>
        { this.props.children }
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

const storiesContext = require.context('../components', true, /.stories.js$/);

function loadStories() {
  storiesContext.keys().forEach((filename) => storiesContext(filename));
}

addDecorator((story) => (
  <Wrapper headManager={headManager}>
    { story() }
  </Wrapper>
));

configure(loadStories, module);
