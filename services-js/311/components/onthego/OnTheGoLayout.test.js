// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import renderer from 'react-test-renderer';

import OnTheGoLayout from './OnTheGoLayout';

test('rendering', async () => {
  const component = renderer.create(<OnTheGoLayout />);
  expect(component.toJSON()).toMatchSnapshot();
});
