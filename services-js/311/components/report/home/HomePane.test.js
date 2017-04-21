// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import HomePane from './HomePane';

const SERVICE_SUMMARIES = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  description: 'Something is threatening the fabric of the universe',
  hasMetadata: true,
  locationRequired: true,
}];

describe('rendering', () => {
  test('existing description', () => {
    const component = renderer.create(
      <HomePane description="Thanos is attacking" handleDescriptionChanged={jest.fn()} topServiceSummaries={SERVICE_SUMMARIES} />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
