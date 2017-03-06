// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import ServiceList from './ServiceList';

const SERVICE_SUMMARIES = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: true,
  locationRequired: true,
}];

test('services', () => {
  const onServiceChosen = jest.fn();
  const component = renderer.create(
    <ServiceList serviceSummaries={SERVICE_SUMMARIES} onServiceChosen={onServiceChosen} />,
  );

  const json = component.toJSON();
  expect(json).toMatchSnapshot();

  const li = json.children[0];
  const a = li.children[0];
  a.props.onClick({ preventDefault: jest.fn() });
  expect(onServiceChosen).toHaveBeenCalledWith('CSMCINC');
});
