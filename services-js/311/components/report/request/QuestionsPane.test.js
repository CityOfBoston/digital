// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import type { Service } from '../../../data/types';
import { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';

import QuestionsPane from './QuestionsPane';

export const DEFAULT_SERVICE: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  attributes: [],
  contactRequirement: 'REQUIRED',
  locationRequirement: 'VISIBLE',
};

export const SERVICE_WITH_METADATA: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  contactRequirement: 'REQUIRED',
  locationRequirement: 'VISIBLE',
  attributes: [{
    required: false,
    type: 'TEXT',
    code: 'ST-CMTS',
    description: 'Please provide any other relevant information:',
    values: null,
    conditionalValues: null,
    dependencies: null,
  }],
};

let store;
let requestForm;

beforeEach(() => {
  store = new AppStore();
  requestForm = new RequestForm();
});

test('blank request', () => {
  const component = renderer.create(
    <QuestionsPane store={store} requestForm={requestForm} serviceName={DEFAULT_SERVICE.name} nextFunc={jest.fn()} nextIsSubmit={false} />,
  );

  expect(component.toJSON()).toMatchSnapshot();
});

test('existing description', () => {
  requestForm.description = 'Please pick up my bulk items. ';

  const component = renderer.create(
    <QuestionsPane store={store} requestForm={requestForm} serviceName={DEFAULT_SERVICE.name} nextFunc={jest.fn()} nextIsSubmit={false} />,
  );

  expect(component.toJSON()).toMatchSnapshot();
});

test('service with metadata', () => {
  requestForm = new RequestForm(SERVICE_WITH_METADATA);

  const component = renderer.create(
    <QuestionsPane store={store} requestForm={requestForm} serviceName={SERVICE_WITH_METADATA.name} nextFunc={jest.fn()} nextIsSubmit={false} />,
  );

  expect(component.toJSON()).toMatchSnapshot();
});
