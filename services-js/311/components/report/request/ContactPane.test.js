// @flow
import React from 'react';
import renderer from 'react-test-renderer';

import type { Service, Request } from '../../../data/types';

import ContactPane from './ContactPane';

export const SERVICE: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: false,
  metadata: null,
};

export const EMPTY_REQUEST: Request = {
  code: null,
  description: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: null,
  address: '',
  attributes: {},
};

export const FILLED_REQUEST: Request = {
  code: null,
  description: '',
  firstName: 'Carol',
  lastName: 'Danvers',
  email: 'marvel@alphaflight.gov',
  phone: '6175551234',
  location: null,
  address: '',
  attributes: {},
};

const ACTIONS = {
  setRequestFirstName: jest.fn(),
  setRequestLastName: jest.fn(),
  setRequestEmail: jest.fn(),
  setRequestPhone: jest.fn(),
  nextFunc: jest.fn(),
};

test('blank request', () => {
  const component = renderer.create(
    <ContactPane service={SERVICE} request={EMPTY_REQUEST} {...ACTIONS} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('filled request', () => {
  const component = renderer.create(
    <ContactPane service={SERVICE} request={FILLED_REQUEST} {...ACTIONS} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
