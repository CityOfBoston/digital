// @flow
/* eslint no-fallthrough: 0 */

import * as React from 'react';
import renderer from 'react-test-renderer';
import Router from 'next/router';

import type { Service, ServiceSummary } from '../../data/types';

import { makeServerContext } from '../../lib/test/make-context';

import getStore from '../../data/store';

import RequestLayout from './RequestLayout';

jest.mock('next/router');

jest.mock('../../data/dao/load-top-service-summaries');
jest.mock('../../data/dao/load-service');
jest.mock('../../data/dao/search-cases');

const loadTopServiceSummaries: JestMockFn = (require('../../data/dao/load-top-service-summaries'): any)
  .default;
const loadService: JestMockFn = (require('../../data/dao/load-service'): any)
  .default;
const searchCases: JestMockFn = (require('../../data/dao/search-cases'): any)
  .default;

const MOCK_SERVICE_SUMMARIES: ServiceSummary[] = [
  {
    name: 'Cosmic Incursion',
    code: 'CSMCINC',
    description: 'Something is threatening the fabric of the universe',
    group: 'ultimate',
  },
];

const MOCK_SERVICE: Service = {
  name: 'Cosmic Incursion',
  description: 'Bad things getting in from other universes',
  code: 'CSMCINC',
  contactRequirement: 'REQUIRED',
  locationRequirement: 'VISIBLE',
  attributes: [
    {
      required: false,
      type: 'TEXT',
      code: 'ST-CMTS',
      description: 'Please provide any other relevant information:',
      values: null,
      conditionalValues: null,
      dependencies: null,
    },
    {
      required: false,
      type: 'STRING',
      code: 'INFO-CSIRMV1',
      description:
        '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
      conditionalValues: null,
      dependencies: null,
    },
    {
      required: true,
      type: 'SINGLEVALUELIST',
      code: 'SR-CSIRMV1',
      description: 'How many dimensions have been breached?',
      values: [
        { key: 'One', name: 'One' },
        { key: 'Two', name: 'Two' },
        { key: 'Three', name: 'Three' },
        { key: 'More than Three', name: 'More than Three' },
      ],
      conditionalValues: [],
      dependencies: null,
    },
  ],
};

let store;

beforeEach(() => {
  store = getStore();
  store.liveAgentAvailable = true;
  store.ui.visibleWidth = 1300;
  searchCases.mockReturnValue(new Promise(() => {}));
});

describe('request form', () => {
  let data;

  beforeEach(async () => {
    loadTopServiceSummaries.mockReturnValue(MOCK_SERVICE_SUMMARIES);

    const ctx = makeServerContext('/request');
    data = (await RequestLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    expect(data.view).toEqual('home');
  });
});

describe('translate page', () => {
  let data;

  beforeEach(async () => {
    loadTopServiceSummaries.mockReturnValue(MOCK_SERVICE_SUMMARIES);

    const ctx = makeServerContext('/request', { translate: '1' });
    data = (await RequestLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    expect(data.view).toEqual('translate');
  });
});

describe('existing service page', () => {
  beforeEach(() => {
    loadService.mockReturnValue(MOCK_SERVICE);
  });

  test('getInitialProps', async () => {
    const ctx = makeServerContext('/request', { code: 'CSMCINC' });
    const data = (await RequestLayout.getInitialProps(ctx)).data;
    expect(data.view).toEqual('request');
  });

  test('rendering phone', async () => {
    const ctx = makeServerContext(
      '/request',
      { code: 'CSMCINC' },
      { isPhone: true }
    );
    const data = (await RequestLayout.getInitialProps(ctx)).data;
    const component = renderer.create(
      <RequestLayout data={data} store={store} />,
      { createNodeMock: () => document.createElement('div') }
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('rendering phone location step', async () => {
    const ctx = makeServerContext(
      '/request',
      { code: 'CSMCINC', stage: 'location' },
      { isPhone: true }
    );
    const data = (await RequestLayout.getInitialProps(ctx)).data;
    const component = renderer.create(
      <RequestLayout data={data} store={store} />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('missing service page', () => {
  let ctx;
  let data;

  beforeEach(async () => {
    loadService.mockReturnValue(null);

    ctx = makeServerContext('/request', { code: 'CSMCINC' });
    data = (await RequestLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    // flow check
    if (ctx.res) {
      expect(ctx.res.statusCode).toEqual(404);
    } else {
      expect(ctx.res).toBeDefined();
    }

    switch (data.view) {
      case 'request':
        expect(data.props.service).toBeNull();
      default:
        expect(data.view).toEqual('request');
    }
  });

  test('rendering', () => {
    const component = renderer.create(
      <RequestLayout data={data} store={store} />
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('routeToServiceForm', () => {
  let requestLayout;

  beforeEach(() => {
    const props: any = {
      data: {},
      store,
    };
    requestLayout = new RequestLayout(props);
  });

  it('defaults to questions', () => {
    requestLayout.routeToServiceForm('CSMCINC');
    expect(Router.push).toHaveBeenCalledWith(
      '/request?code=CSMCINC',
      '/request/CSMCINC'
    );
  });

  it('includes the stage', () => {
    requestLayout.routeToServiceForm('CSMCINC', 'contact');
    expect(Router.push).toHaveBeenCalledWith(
      '/request?code=CSMCINC&stage=contact',
      '/request/CSMCINC/contact'
    );
  });
});
