// @flow
import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../../data/store';

import ContactPane from './ContactPane';

let store;

beforeEach(() => {
  store = new AppStore();
});

test('blank request', () => {
  const component = renderer.create(
    <ContactPane store={store} nextFunc={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('filled request', () => {
  store.contactInfo.firstName = 'Carol';
  store.contactInfo.lastName = 'Danvers';
  store.contactInfo.email = 'marvel@alphaflight.gov';
  store.contactInfo.phone = '6175551234';

  const component = renderer.create(
    <ContactPane store={store} nextFunc={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
