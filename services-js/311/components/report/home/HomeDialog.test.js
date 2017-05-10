// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import { makeServerContext } from '../../../lib/test/make-context';
import { AppStore } from '../../../data/store';
import HomeDialog from './HomeDialog';
import type { InitialProps } from './HomeDialog';

jest.mock('../../../data/dao/load-top-service-summaries');
jest.mock('../../../data/dao/load-service-suggestions');

const loadTopServiceSummaries: JestMockFn = (require('../../../data/dao/load-top-service-summaries'): any).default;
const loadServiceSuggestions: JestMockFn = (require('../../../data/dao/load-service-suggestions'): any).default;

jest.mock('lodash/debounce');
const debounce: JestMockFn = (require('lodash/debounce'): any);

const SERVICE_SUMMARIES = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  description: 'Something is threatening the fabric of the universe',
  hasMetadata: true,
  locationRequired: true,
}];

beforeEach(() => {
  // mock implementation always fires, but after a delay
  debounce.mockImplementation((fn) => (...args) => Promise.resolve().then(fn.bind(null, ...args)));
});

describe('home page', () => {
  let initialProps: InitialProps;
  let store;
  let loopbackGraphql;

  beforeEach(async () => {
    store = new AppStore();
    loopbackGraphql = jest.fn();

    loadTopServiceSummaries.mockReturnValue(SERVICE_SUMMARIES);

    const ctx = makeServerContext('/report');
    initialProps = await HomeDialog.getInitialProps(ctx);
  });

  test('getInitialProps', () => {
    expect(initialProps.stage).toEqual('home');
    expect(initialProps.topServiceSummaries).toHaveLength(1);
  });

  test('rendering', () => {
    const component = renderer.create(
      <HomeDialog store={store} loopbackGraphql={loopbackGraphql} {...initialProps} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('choose page', () => {
  let initialProps: InitialProps;
  let store;
  let loopbackGraphql;

  beforeEach(async () => {
    store = new AppStore();
    loopbackGraphql = jest.fn();

    loadTopServiceSummaries.mockReturnValue(SERVICE_SUMMARIES);

    const ctx = makeServerContext('/report', { stage: 'choose', description: 'Thanos is attacking' });
    initialProps = await HomeDialog.getInitialProps(ctx);
  });

  test('getInitialProps', () => {
    expect(initialProps.stage).toEqual('choose');
    expect(initialProps.description).toEqual('Thanos is attacking');
  });

  test('rendering', () => {
    const component = renderer.create(
      <HomeDialog store={store} loopbackGraphql={loopbackGraphql} {...initialProps} />,
      { createNodeMock: () => document.createElement('div') },
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});


describe('integration', () => {
  let wrapper;
  let store;

  let resolveSuggestions;

  beforeEach(() => {
    store = new AppStore();

    loadServiceSuggestions.mockReturnValue(new Promise((resolve) => { resolveSuggestions = resolve; }));

    wrapper = mount(<HomeDialog store={store} description="Thanos is attacking" loopbackGraphql={jest.fn()} stage="choose" topServiceSummaries={[]} bypassTranslateDialog />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('description and suggestions', async () => {
    // get on the other side of the debounced lookup triggered by component will mount
    await Promise.resolve();

    expect(loadServiceSuggestions).toHaveBeenCalledWith(expect.anything(), 'Thanos is attacking');

    await resolveSuggestions(SERVICE_SUMMARIES);

    // The service should now appear in the list
    const serviceLink = wrapper.find('a').findWhere((el) => el.text() === 'Cosmic Incursion');
    expect(serviceLink.length).toEqual(1);
    // We look to the parent, which is a Next Link component.
    expect(serviceLink.first().parent().props().href).toEqual('/report?code=CSMCINC&description=Thanos%20is%20attacking');
  });
});
