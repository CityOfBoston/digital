import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import HeadManager from 'next/dist/client/head-manager';
import { configure, addDecorator } from '@kadira/storybook';
import { makeStore } from '../data/store';
import { setKeys } from '../data/store/keys';

// eslint-disable-next-line import/extensions
import DOT_ENV from '../.env';
import parseDotEnv from '../lib/test/parse-dot-env';

const dotEnv = parseDotEnv(DOT_ENV);
const headManager = new HeadManager();

class Wrapper extends React.Component {
  static childContextTypes = {
    headManager: PropTypes.object,
  }

  constructor() {
    super();

    if (window.parent) {
      // eslint-disable-next-line no-underscore-dangle
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = window.parent.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    }

    this.store = makeStore();
    this.store.dispatch(setKeys({
      googleApi: dotEnv.GOOGLE_API_KEY,
    }));
  }

  getChildContext() {
    return { headManager: this.props.headManager };
  }

  render() {
    return (
      <Provider store={this.store}>
        { this.props.children }
      </Provider>
    );
  }
}

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
