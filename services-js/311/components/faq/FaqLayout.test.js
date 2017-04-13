// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import renderer from 'react-test-renderer';

import FaqLayout from './FaqLayout';

test('rendering', async () => {
  const component = renderer.create(<FaqLayout suppressQuestions />);
  expect(component.toJSON()).toMatchSnapshot();
});
