// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import type { Service } from '../../data/types';
import type { State as Request } from '../../data/store/request';

import ReportFormDialog from './ReportFormDialog';

const DEFAULT_SERVICE: Service = {
  name: 'Needle Pickup',
  code: 'needles',
  hasMetadata: false,
  metadata: null,
};

const DEFAULT_REQUEST: Request = {
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

const ACTIONS = {
  onFirstNameChange: jest.fn(),
  onLastNameChange: jest.fn(),
  onEmailChange: jest.fn(),
  onPhoneChange: jest.fn(),
  onShowService: jest.fn(),
  onAttributeChange: jest.fn(),
};

test('missing service', () => {
  const component = renderer.create(
    <ReportFormDialog service={null} request={DEFAULT_REQUEST} {...ACTIONS} loopbackGraphql={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('blank request', () => {
  const component = renderer.create(
    <ReportFormDialog service={DEFAULT_SERVICE} request={DEFAULT_REQUEST} {...ACTIONS} loopbackGraphql={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('existing description', () => {
  const component = renderer.create(
    <ReportFormDialog
      service={DEFAULT_SERVICE}
      request={{ ...DEFAULT_REQUEST, description: 'Please pick up my bulk items. ' }}
      {...ACTIONS}
      loopbackGraphql={jest.fn()}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
