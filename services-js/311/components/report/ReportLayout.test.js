// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import renderer from 'react-test-renderer';
import Router from 'next/router';

import type { Service, ServiceSummary } from '../../data/types';

import { makeServerContext } from '../../lib/test/make-context';

import getStore from '../../data/store';

import ReportLayout from './ReportLayout';

jest.mock('next/router');

jest.mock('../../data/dao/load-top-service-summaries');
jest.mock('../../data/dao/load-service');
jest.mock('../../data/dao/search-requests');

const loadTopServiceSummaries: JestMockFn = (require('../../data/dao/load-top-service-summaries'): any).default;
const loadService: JestMockFn = (require('../../data/dao/load-service'): any).default;
const searchRequests: JestMockFn = (require('../../data/dao/search-requests'): any).default;

const MOCK_SERVICE_SUMMARIES: ServiceSummary[] = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  description: 'Something is threatening the fabric of the universe',
  group: 'ultimate',
}];

const MOCK_SERVICE: Service = {
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
  }, {
    required: false,
    type: 'STRING',
    code: 'INFO-CSIRMV1',
    description: '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
    values: null,
    conditionalValues: null,
    dependencies: null,
  }, {
    required: true,
    type: 'SINGLEVALUELIST',
    code: 'SR-CSIRMV1',
    description: 'How many dimensions have been breached?',
    values: [{ key: 'One', name: 'One' }, { key: 'Two', name: 'Two' }, { key: 'Three', name: 'Three' }, { key: 'More than Three', name: 'More than Three' }],
    conditionalValues: [],
    dependencies: null,
  }],
};

let store;

beforeEach(() => {
  store = getStore();
  store.liveAgentAvailable = true;
  store.ui.visibleWidth = 1300;
  searchRequests.mockReturnValue(new Promise(() => {}));
});

describe('report form', () => {
  let data;

  beforeEach(async () => {
    loadTopServiceSummaries.mockReturnValue(MOCK_SERVICE_SUMMARIES);

    const ctx = makeServerContext('/report');
    data = (await ReportLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    expect(data.view).toEqual('home');
  });

  test('rendering', () => {
    const component = renderer.create(
      <ReportLayout store={store} data={data} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('existing service page', () => {
  beforeEach(() => {
    loadService.mockReturnValue(MOCK_SERVICE);
  });

  test('getInitialProps', async () => {
    const ctx = makeServerContext('/report', { code: 'CSMCINC' });
    const data = (await ReportLayout.getInitialProps(ctx)).data;
    expect(data.view).toEqual('request');
  });

  test('rendering', async () => {
    const ctx = makeServerContext('/report', { code: 'CSMCINC' });
    const data = (await ReportLayout.getInitialProps(ctx)).data;
    const component = renderer.create(
      <ReportLayout data={data} store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('rendering phone', async () => {
    const ctx = makeServerContext('/report', { code: 'CSMCINC' }, { isPhone: true });
    const data = (await ReportLayout.getInitialProps(ctx)).data;
    const component = renderer.create(
      <ReportLayout data={data} store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('rendering phone location step', async () => {
    const ctx = makeServerContext('/report', { code: 'CSMCINC', stage: 'location' }, { isPhone: true });
    const data = (await ReportLayout.getInitialProps(ctx)).data;
    const component = renderer.create(
      <ReportLayout data={data} store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('missing service page', () => {
  let ctx;
  let data;

  beforeEach(async () => {
    loadService.mockReturnValue(null);

    ctx = makeServerContext('/report', { code: 'CSMCINC' });
    data = (await ReportLayout.getInitialProps(ctx)).data;
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
      <ReportLayout data={data} store={store} />,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('routeToServiceForm', () => {
  let reportLayout;

  beforeEach(() => {
    const props: any = {
      data: {},
      store,
    };
    reportLayout = new ReportLayout(props);
  });

  it('defaults to questions', () => {
    reportLayout.routeToServiceForm('CSMCINC');
    expect(Router.push).toHaveBeenCalledWith('/report?code=CSMCINC', '/report/CSMCINC');
  });

  it('includes the stage', () => {
    reportLayout.routeToServiceForm('CSMCINC', 'contact');
    expect(Router.push).toHaveBeenCalledWith('/report?code=CSMCINC&stage=contact', '/report/CSMCINC/contact');
  });
});
