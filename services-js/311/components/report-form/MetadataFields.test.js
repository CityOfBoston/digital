// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import type { Service } from '../../data/types';

import MetadataFields from './MetadataFields';

const SERVICE_WITH_METADATA: Service = {
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

const SERVICE_WITHOUT_METADATA: Service = {
  name: 'Avengers Assemble',
  code: 'AVGASSM',
  hasMetadata: false,
  metadata: null,
};

test('service with metadata renders', () => {
  const component = renderer.create(
    <MetadataFields service={SERVICE_WITH_METADATA} attributeChanged={jest.fn()} attributes={{ 'ST-CMTS': 'It’s been better.' }} />,
  );

  expect(component.toJSON).toBeDefined();
});

test('service without metadata renders', () => {
  const component = renderer.create(
    <MetadataFields service={SERVICE_WITHOUT_METADATA} attributeChanged={jest.fn()} attributes={{}} />,
  );

  expect(component.toJSON).toBeDefined();
});
