import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import { makeServerContext } from '../../../lib/test/make-context';
import HomeDialog, { InitialProps, Props } from './HomeDialog';
import {
  FetchGraphql,
  GaSiteAnalytics,
} from '@cityofboston/next-client-common';
import Ui from '../../../data/store/Ui';
import LiveAgent from '../../../data/store/LiveAgent';

jest.mock('../../../data/queries/load-top-service-summaries');
jest.mock('../../../data/queries/load-service-suggestions');

const loadTopServiceSummaries: jest.Mock = (require('../../../data/queries/load-top-service-summaries') as any)
  .default;
const loadServiceSuggestions: jest.Mock = (require('../../../data/queries/load-service-suggestions') as any)
  .default;

jest.mock('lodash/debounce');
const debounce: jest.Mock = require('lodash/debounce') as any;

const SERVICE_SUMMARIES = [
  {
    name: 'Cosmic Incursion',
    code: 'CSMCINC',
    description: 'Something is threatening the fabric of the universe',
    hasMetadata: true,
    locationRequired: true,
  },
];

beforeEach(() => {
  // mock implementation always fires, but after a delay
  debounce.mockImplementation(fn => (...args) =>
    Promise.resolve().then(fn.bind(null, ...args))
  );
});

describe('home page', () => {
  let initialProps: InitialProps;
  let fetchGraphql: FetchGraphql;

  beforeEach(async () => {
    fetchGraphql = jest.fn();

    loadTopServiceSummaries.mockReturnValue(SERVICE_SUMMARIES);

    const ctx = makeServerContext('/request');
    initialProps = await HomeDialog.getInitialProps(ctx, { fetchGraphql });
  });

  test('getInitialProps', () => {
    expect(initialProps.stage).toEqual('home');
    expect(initialProps.topServiceSummaries).toHaveLength(1);
  });

  test('rendering', () => {
    const component = renderer.create(
      React.createElement<Props>(HomeDialog, {
        fetchGraphql,
        siteAnalytics: new GaSiteAnalytics(),
        ui: new Ui(),
        liveAgent: new LiveAgent(''),
        languages: [],
        topServiceSummaries: initialProps.topServiceSummaries,
        description: initialProps.description,
        stage: initialProps.stage,
        bypassTranslateDialog: initialProps.bypassTranslateDialog,
      })
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('choose page', () => {
  let initialProps: InitialProps;
  let fetchGraphql: FetchGraphql;

  beforeEach(async () => {
    fetchGraphql = jest.fn();

    loadTopServiceSummaries.mockReturnValue(SERVICE_SUMMARIES);

    const ctx = makeServerContext('/request', {
      stage: 'choose',
      description: 'Thanos is attacking',
    });
    initialProps = await HomeDialog.getInitialProps(ctx, { fetchGraphql });
  });

  test('getInitialProps', () => {
    expect(initialProps.stage).toEqual('choose');
    expect(initialProps.description).toEqual('Thanos is attacking');
  });

  test('rendering', () => {
    const component = renderer.create(
      React.createElement<Props>(HomeDialog, {
        fetchGraphql,
        siteAnalytics: new GaSiteAnalytics(),
        ui: new Ui(),
        liveAgent: new LiveAgent(''),
        languages: [],
        topServiceSummaries: initialProps.topServiceSummaries,
        description: initialProps.description,
        stage: initialProps.stage,
        bypassTranslateDialog: initialProps.bypassTranslateDialog,
      }),
      { createNodeMock: () => document.createElement('div') }
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

// disabled as per Reilly 9/23 jm
xdescribe('integration', () => {
  let wrapper;
  let resolveSuggestions;

  beforeEach(() => {
    loadServiceSuggestions.mockReturnValue(
      new Promise(resolve => {
        resolveSuggestions = resolve;
      })
    );

    wrapper = mount(
      <HomeDialog
        liveAgent={new LiveAgent('')}
        siteAnalytics={new GaSiteAnalytics()}
        ui={new Ui()}
        languages={[]}
        description="Thanos is attacking"
        fetchGraphql={jest.fn()}
        stage="choose"
        topServiceSummaries={[]}
        bypassTranslateDialog
      />
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('description and suggestions', async () => {
    // get on the other side of the debounced lookup triggered by component will mount
    await Promise.resolve();

    expect(loadServiceSuggestions).toHaveBeenCalledWith(
      expect.anything(),
      'Thanos is attacking'
    );

    await resolveSuggestions(SERVICE_SUMMARIES);
    wrapper.update();

    // The service should now appear in the list
    const serviceLink = wrapper
      .find('a')
      .filterWhere(el => el.text().startsWith('Cosmic Incursion'));
    expect(serviceLink.length).toEqual(1);
    // We look to the parent, which is a Next Link component.
    expect(serviceLink.first().props().href).toEqual('/request/CSMCINC');
  });
});
