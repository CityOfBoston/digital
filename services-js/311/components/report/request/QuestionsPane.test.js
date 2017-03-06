// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import type { Service, Request } from '../../../data/types';

import QuestionsPane from './QuestionsPane';

export const DEFAULT_SERVICE: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: false,
  metadata: null,
};

export const DEFAULT_REQUEST: Request = {
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

export const SERVICE_WITH_METADATA: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: true,
  metadata: {
    attributes: [{
      required: false,
      type: 'TEXT',
      code: 'ST-CMTS',
      description: 'Please provide any other relevant information:',
      values: null,
    }],
  },
};

export const REQUEST_WITH_METADATA: Request = {
  code: null,
  description: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: null,
  address: '',
  attributes: {
    ST_CMTS: 'A portal to the Negative Zone has opened',
  },
};

const ACTIONS = {
  nextFunc: jest.fn(),
  setAttribute: jest.fn(),
};

test('blank request', () => {
  const component = renderer.create(
    <QuestionsPane service={DEFAULT_SERVICE} request={DEFAULT_REQUEST} {...ACTIONS} loopbackGraphql={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('existing description', () => {
  const component = renderer.create(
    <QuestionsPane
      service={DEFAULT_SERVICE}
      request={{ ...DEFAULT_REQUEST, description: 'Please pick up my bulk items. ' }}
      {...ACTIONS}
      loopbackGraphql={jest.fn()}
    />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});

test('service with metadata', () => {
  const component = renderer.create(
    <QuestionsPane
      service={SERVICE_WITH_METADATA}
      request={REQUEST_WITH_METADATA}
      {...ACTIONS}
      loopbackGraphql={jest.fn()}
    />,
  );

  expect(component.toJSON()).toMatchSnapshot();
});
