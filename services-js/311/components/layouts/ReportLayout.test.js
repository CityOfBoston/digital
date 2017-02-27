// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import ReportLayout from './ReportLayout';
import type { Service, ServiceSummary } from '../../data/types';
import { makeStore } from '../../data/store';

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
    }, {
      required: false,
      type: 'STRING',
      code: 'INFO-CSIRMV1',
      description: '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
    }, {
      required: true,
      type: 'SINGLEVALUELIST',
      code: 'SR-CSIRMV1',
      description: 'How many dimensions have been breached?',
      values: [{ key: 'One', name: 'One' }, { key: 'Two', name: 'Two' }, { key: 'Three', name: 'Three' }, { key: 'More than Three', name: 'More than Three' }],
    }],
  },
};

let store;
let defaultProps;

beforeEach(() => {
  store = makeStore();

  defaultProps = {
    showServiceForm: jest.fn(),
    loopbackGraphql: jest.fn(),
    goToReportForm: jest.fn(),
  };
});

describe('report form', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      view: 'summaries',
      serviceSummaries: MOCK_SERVICE_SUMMARIES,
      pickLocation: false,
    };
  });

  test('title', () => {
    expect(ReportLayout.getTitle(initialProps)).toEqual('Report a Problem');
  });

  test('rendering', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ReportLayout initialProps={initialProps} {...defaultProps} />
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('service form', () => {
  describe('existing', () => {
    let initialProps;

    beforeEach(() => {
      initialProps = {
        view: 'service',
        code: 'CSMCINC',
        service: MOCK_SERVICE,
        pickLocation: false,
      };
    });

    test('title', () => {
      expect(ReportLayout.getTitle(initialProps)).toEqual('Cosmic Incursion');
    });

    test('rendering', () => {
      const component = renderer.create(
        <Provider store={store}>
          <ReportLayout initialProps={initialProps} {...defaultProps} />
        </Provider>,
      );

      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe('missing', () => {
    let initialProps;

    beforeEach(() => {
      initialProps = {
        view: 'service',
        code: 'INFEARTHS',
        service: null,
        pickLocation: false,
      };
    });

    test('title', () => {
      expect(ReportLayout.getTitle(initialProps)).toEqual('Not found');
    });

    test('rendering missing', () => {
      const component = renderer.create(
        <Provider store={store}>
          <ReportLayout initialProps={initialProps} {...defaultProps} />
        </Provider>,
    );

      expect(component.toJSON()).toMatchSnapshot();
    });
  });
});

describe('location picker', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {
      view: 'service',
      code: 'CSMCINC',
      service: MOCK_SERVICE,
      pickLocation: true,
    };
  });

  test('title', () => {
    expect(ReportLayout.getTitle(initialProps)).toEqual('Choose location');
  });

  test('rendering', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ReportLayout initialProps={initialProps} {...defaultProps} />
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
