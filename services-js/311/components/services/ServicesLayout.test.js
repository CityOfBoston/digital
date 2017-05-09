// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../data/store';

import ServicesLayout from './ServicesLayout';

test('rendering', async () => {
  const store = new AppStore();
  const component = renderer.create(<ServicesLayout services={[]} store={store} />);
  expect(component.toJSON()).toMatchSnapshot();
});
