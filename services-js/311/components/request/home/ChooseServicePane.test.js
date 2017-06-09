// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import Ui from '../../../data/store/Ui';
import ChooseServicePane from './ChooseServicePane';

const SERVICE_SUMMARIES = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  description: 'Something is threatening the fabric of the universe',
  group: 'ultimate',
}];

describe('rendering', () => {
  let ui;

  beforeEach(() => {
    ui = new Ui();
  });

  test('some suggested summaries', () => {
    const component = renderer.create(
      <ChooseServicePane description="Thanos is attacking" suggestedServiceSummaries={SERVICE_SUMMARIES} ui={ui} />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  test('no suggested summaries', () => {
    const component = renderer.create(
      <ChooseServicePane description="Thanos is attacking" suggestedServiceSummaries={[]} ui={ui} />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  test('loading', () => {
    const component = renderer.create(
      <ChooseServicePane description="Thanos is attacking" suggestedServiceSummaries={null} ui={ui} />,
      { createNodeMock: () => document.createElement('div') },
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  test('no description', () => {
    const component = renderer.create(
      <ChooseServicePane description="" suggestedServiceSummaries={[]} ui={ui} />,
    );

    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
