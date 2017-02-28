// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import TestUtils from 'react-addons-test-utils';

import type { Service } from '../../data/types';
import type { State as Request } from '../../data/store/request';

import SubmitRequestGraphql from '../../data/graphql/SubmitRequest.graphql';
import type { SubmitRequestMutationVariables } from '../../data/graphql/schema.flow';

import ReportFormDialog from './ReportFormDialog';

const DEFAULT_SERVICE: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
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

test('submission', async () => {
  const request = {
    code: 'CSMCINC',
    description: 'Things are bad',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'marvel@alphaflight.gov',
    phone: '',
    location: null,
    address: '',
    attributes: {
      DIMENSIONS: '3',
      AVENGERS: ['ms-marvel', 'thor', 'captain-america'],
    },
  };

  let resolveGraphql = () => {};

  const loopbackGraphql = jest.fn(() => new Promise((resolve) => {
    resolveGraphql = resolve;
  }));

  const component = TestUtils.renderIntoDocument(
    <ReportFormDialog
      service={DEFAULT_SERVICE}
      request={request}
      {...ACTIONS}
      loopbackGraphql={loopbackGraphql}
    />,
  );

  const button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
  expect(button.disabled).toEqual(false);

  TestUtils.Simulate.click(button);
  expect(button.disabled).toEqual(true);

  const mutationVariables: SubmitRequestMutationVariables = {
    code: 'CSMCINC',
    description: 'Things are bad',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'marvel@alphaflight.gov',
    phone: '',
    address: '',
    location: null,
    attributes: [
      { code: 'DIMENSIONS', value: '3' },
      { code: 'AVENGERS', value: 'ms-marvel' },
      { code: 'AVENGERS', value: 'thor' },
      { code: 'AVENGERS', value: 'captain-america' },
    ],
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(SubmitRequestGraphql, mutationVariables);
  resolveGraphql({});

  // get on the other side of the component's promise response
  await Promise.resolve();

  expect(button.disabled).toEqual(false);
});
