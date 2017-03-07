// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import renderer from 'react-test-renderer';
import Router from 'next/router';

import { Provider } from 'react-redux';

import type { Service, ServiceSummary } from '../../data/types';
import { makeStore } from '../../data/store';

import { makeServerContext } from '../../lib/test/make-context';
import makeLoopbackGraphql from '../../data/graphql/loopback-graphql';

import LoadServiceSummariesGraphql from '../../data/graphql/LoadServiceSummaries.graphql';
import LoadServiceGraphql from '../../data/graphql/LoadService.graphql';
import type { LoadServiceSummariesQuery, LoadServiceQuery } from '../../data/graphql/schema.flow';

import ReportLayout from './ReportLayout';

jest.mock('next/router');
jest.mock('../../data/graphql/loopback-graphql');

const MOCK_SERVICE_SUMMARIES: ServiceSummary[] = [{
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: true,
  locationRequired: true,
}];

const MOCK_SERVICE: Service = {
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
      conditionalValues: null,
    }, {
      required: false,
      type: 'STRING',
      code: 'INFO-CSIRMV1',
      description: '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
      conditionalValues: null,
    }, {
      required: true,
      type: 'SINGLEVALUELIST',
      code: 'SR-CSIRMV1',
      description: 'How many dimensions have been breached?',
      values: [{ key: 'One', name: 'One' }, { key: 'Two', name: 'Two' }, { key: 'Three', name: 'Three' }, { key: 'More than Three', name: 'More than Three' }],
      conditionalValues: null,
    }],
  },
};

const MOCK_SERVICE_SUMMARIES_RESPONSE: LoadServiceSummariesQuery = {
  services: MOCK_SERVICE_SUMMARIES,
};

const MOCK_SERVICE_RESPONSE: LoadServiceQuery = {
  service: MOCK_SERVICE,
};

const MOCK_MISSING_SERVICE_RESPONSE: LoadServiceQuery = {
  service: null,
};

function mockGraphql(query, value) {
  // check to make Flow happy
  if (typeof makeLoopbackGraphql.mockResponse === 'function') {
    makeLoopbackGraphql.mockResponse(query, value);
  }
}

let store;

beforeEach(() => {
  store = makeStore();

  mockGraphql(LoadServiceSummariesGraphql, MOCK_SERVICE_SUMMARIES_RESPONSE);
  mockGraphql(LoadServiceGraphql, MOCK_SERVICE_RESPONSE);
});

describe('report form', () => {
  let data;

  beforeEach(async () => {
    const ctx = makeServerContext('/report');
    data = (await ReportLayout.getInitialProps(ctx, store)).data;
  });

  test('getInitialProps', () => {
    switch (data.view) {
      case 'home':
        expect(data.serviceSummaries).toHaveLength(1);
      default:
        expect(data.view).toEqual('home');
    }
  });

  test('rendering', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ReportLayout data={data} />
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('existing service page', () => {
  let data;

  beforeEach(async () => {
    const ctx = makeServerContext('/report', { code: 'CSMCINC' });
    data = (await ReportLayout.getInitialProps(ctx, store)).data;
  });

  test('getInitialProps', () => {
    switch (data.view) {
      case 'request':
        expect(data.service).toBeDefined();
        expect(data.stage).toEqual('questions');
      default:
        expect(data.view).toEqual('request');
    }
  });

  test('service is cached', async () => {
    // store should have the service cached by code from the beforeEach above,
    // so to enforce that we're not fetching a second time we clear this out
    // of the fake GraphQL responses.
    mockGraphql(LoadServiceGraphql, null);

    const ctx = makeServerContext('/report', { code: 'CSMCINC' });
    const nextData = (await ReportLayout.getInitialProps(ctx, store)).data;

    expect(nextData).toEqual(data);
  });

  test('rendering', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ReportLayout data={data} />
      </Provider>,
      );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('missing service page', () => {
  let ctx;
  let data;

  beforeEach(async () => {
    mockGraphql(LoadServiceGraphql, MOCK_MISSING_SERVICE_RESPONSE);

    ctx = makeServerContext('/report', { code: 'CSMCINC' });
    data = (await ReportLayout.getInitialProps(ctx, store)).data;
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
        expect(data.service).toBeNull();
      default:
        expect(data.view).toEqual('request');
    }
  });

  test('rendering', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ReportLayout data={data} />
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('routeToServiceForm', () => {
  let reportLayout;

  beforeEach(() => {
    const props: any = {};
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
