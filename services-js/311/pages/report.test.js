// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

// Named rather than default import so we don't have the withStore wrapper that
// obscures types.
import { Report } from './report';

import { makeServerContext } from '../lib/test/make-context';
import makeLoopbackGraphql from '../data/graphql/loopback-graphql';

import LoadServiceSummariesGraphql from '../data/graphql/LoadServiceSummaries.graphql';
import LoadServiceGraphql from '../data/graphql/LoadService.graphql';
import type { LoadServiceSummariesQuery, LoadServiceQuery } from '../data/graphql/schema.flow';
import type { InitialProps } from '../components/layouts/ReportLayout';

jest.mock('../data/graphql/loopback-graphql');

const MOCK_SERVICE_SUMMARIES_RESPONSE: LoadServiceSummariesQuery = {
  services: [{
    name: 'Cosmic Incursion',
    code: 'CSMCINC',
    hasMetadata: true,
    locationRequired: true,
  }],
};

const MOCK_SERVICE_RESPONSE: LoadServiceQuery = {
  service: {
    name: 'Cosmic Incursion',
    code: 'CSMCINC',
    hasMetadata: false,
    metadata: null,
  },
};

const MOCK_MISSING_SERVICE_RESPONSE: LoadServiceQuery = {
  service: null,
};

const shallowRenderer = ReactTestUtils.createRenderer();

function mockGraphql(query, value) {
  // check to make Flow happy
  if (typeof makeLoopbackGraphql.mockResponse === 'function') {
    makeLoopbackGraphql.mockResponse(query, value);
  }
}

describe('report form', () => {
  let ctx;

  beforeEach(() => {
    mockGraphql(LoadServiceSummariesGraphql, MOCK_SERVICE_SUMMARIES_RESPONSE);
    ctx = makeServerContext('/report');
  });

  test('getInitialProps', async () => {
    const initialProps: InitialProps = await Report.getInitialProps(ctx);

    switch (initialProps.view) {
      case 'summaries':
        expect(initialProps.serviceSummaries).toHaveLength(1);
      default:
        expect(initialProps.view).toEqual('summaries');
    }
  });

  test('rendering', async () => {
    const initialProps: InitialProps = await Report.getInitialProps(ctx);
    expect(shallowRenderer.render(<Report {...initialProps} />)).toMatchSnapshot();
  });
});

describe('service page', () => {
  let ctx;

  beforeEach(() => {
    ctx = makeServerContext('/report', { code: 'CSMCINC' });
  });

  describe('exists', () => {
    beforeEach(() => {
      mockGraphql(LoadServiceGraphql, MOCK_SERVICE_RESPONSE);
    });

    test('getInitialProps', async () => {
      const initialProps = await Report.getInitialProps(ctx);

      switch (initialProps.view) {
        case 'service':
          expect(initialProps.service).toBeDefined();
          expect(initialProps.pickLocation).toEqual(false);
        default:
          expect(initialProps.view).toEqual('service');
      }
    });

    test('rendering', async () => {
      const initialProps = await Report.getInitialProps(ctx);
      expect(shallowRenderer.render(<Report {...initialProps} />)).toMatchSnapshot();
    });
  });

  describe('not found', () => {
    beforeEach(() => {
      mockGraphql(LoadServiceGraphql, MOCK_MISSING_SERVICE_RESPONSE);
    });

    test('getInitialProps', async () => {
      const initialProps = await Report.getInitialProps(ctx);

      if (ctx.res) {
        expect(ctx.res.statusCode).toEqual(404);
      } else {
        expect(ctx.res).toBeDefined();
      }

      switch (initialProps.view) {
        case 'service':
          expect(initialProps.service).toBeNull();
        default:
          expect(initialProps.view).toEqual('service');
      }
    });

    test('rendering', async () => {
      const initialProps = await Report.getInitialProps(ctx);
      expect(shallowRenderer.render(<Report {...initialProps} />)).toMatchSnapshot();
    });
  });
});

describe('location picker', () => {
  let ctx;

  beforeEach(() => {
    mockGraphql(LoadServiceGraphql, MOCK_SERVICE_RESPONSE);
    ctx = makeServerContext('/report', { code: 'CSMCINC', pickLocation: 'true' });
  });

  test('getInitialProps', async () => {
    const initialProps = await Report.getInitialProps(ctx);

    switch (initialProps.view) {
      case 'service':
        expect(initialProps.service).toBeDefined();
        expect(initialProps.pickLocation).toEqual(true);
      default:
        expect(initialProps.view).toEqual('service');
    }
  });

  test('rendering', async () => {
    const initialProps = await Report.getInitialProps(ctx);
    expect(shallowRenderer.render(<Report {...initialProps} />)).toMatchSnapshot();
  });
});
