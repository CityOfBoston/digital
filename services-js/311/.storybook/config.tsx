import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { setConfig } from 'next/config';
import Router from 'next/router';
import { configure, addDecorator, addParameters } from '@storybook/react';
import inPercy from '@percy-io/in-percy';
import svg4everybody from 'svg4everybody';
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

import { makeNextConfig } from '../lib/config';
import parseDotEnv from '../lib/test/parse-dot-env';

import { loadStories, storybookOptions } from '@cityofboston/storybook-common';

import './addons';

let env;

// The shenanigans below are our way of getting the environment variables
// from .env into the browser, where our config code can see them in.
//
// There's no .env on Travis, but we want to run the storybook for Percy
// snapshot testing. So, we guard the require with a try/catch and then
// just set the MAPBOX env variables in the Travis UI.
//
// We have to use require so that we can catch the exception, but our
// inline import plugin only works with import statements. So, we require
// a JS module that has its own import of '../.env' to export.
try {
  const DOT_ENV = require('./dot-env-file').default;
  env = parseDotEnv(DOT_ENV);
} catch (e) {
  // the transform-inline-environment-variables babel plugin will insert
  // these in
  env = {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    MAPBOX_STYLE_PATH: process.env.MAPBOX_STYLE_PATH,
  };
}

setConfig(makeNextConfig(env));

class Wrapper extends React.Component<{
  children: ReactNode;
}> {
  static childContextTypes = {
    router: PropTypes.object,
  };

  getChildContext() {
    return {
      router: Router,
    };
  }

  render() {
    if (inPercy() || process.env.NODE_ENV === 'test') {
      (VelocityTransitionGroup as any).disabledForTest = true;
    }

    return this.props.children;
  }
}

const storiesContext = require.context(
  '../components',
  true,
  /.stories.[jt]sx?$/
);

addDecorator((story: () => ReactNode) => {
  svg4everybody();

  return <Wrapper>{story()}</Wrapper>;
});

addParameters(storybookOptions('311'));

configure(() => loadStories(storiesContext), module);
