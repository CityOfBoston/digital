// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import ServiceList from './ServiceList';

const SERVICE_SUMMARIES = [{
  name: 'Needle Pickup',
  code: 'needles',
  hasMetadata: true,
  locationRequired: true,
}];

test('services', () => {
  const component = renderer.create(
    <ServiceList serviceSummaries={SERVICE_SUMMARIES} onServiceChosen={jest.fn()} />,
  );
  expect(component.toJSON()).toMatchSnapshot();
});
