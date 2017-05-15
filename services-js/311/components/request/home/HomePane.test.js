// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { AppStore } from '../../../data/store';
import HomePane from './HomePane';

const SERVICE_SUMMARIES = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  description: 'Something is threatening the fabric of the universe',
  group: 'ultimate',
  hasMetadata: true,
  locationRequired: true,
}];

describe('rendering', () => {
  test('existing description', () => {
    const component = renderer.create(
      <HomePane store={new AppStore()} description="Thanos is attacking" handleDescriptionChanged={jest.fn()} nextFn={jest.fn()} topServiceSummaries={SERVICE_SUMMARIES} />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
