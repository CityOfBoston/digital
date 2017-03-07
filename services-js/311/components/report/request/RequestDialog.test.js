// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import RequestDialog from './RequestDialog';

import type { Service } from '../../../data/types';
import { makeStore } from '../../../data/store';
import { resetRequestForService, DEFAULT_STATE as MOCK_REQUEST } from '../../../data/store/request';

import { GraphQLError } from '../../../data/graphql/loopback-graphql';
import type { SubmitRequestMutation } from '../../../data/graphql/schema.flow';

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

const MOCK_ACTIONS = {
  loopbackGraphql: jest.fn(),
  routeToServiceForm: jest.fn(),
  resetRequestForService: jest.fn(),
  setLocationMapActive: jest.fn(),
  locationMapSearch: jest.fn(),
};

describe('rendering', () => {
  let store;
  let request;

  beforeEach(() => {
    store = makeStore();
    store.dispatch(resetRequestForService(MOCK_SERVICE));
    request = store.getState().request;
  });

  test('questions', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RequestDialog service={MOCK_SERVICE} request={request} stage="questions" {...MOCK_ACTIONS} />
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('location', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RequestDialog service={MOCK_SERVICE} request={request} stage="location" {...MOCK_ACTIONS} />
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('contact', () => {
    const component = renderer.create(
      <Provider store={store}>
        <RequestDialog service={MOCK_SERVICE} request={request} stage="contact" {...MOCK_ACTIONS} />
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('submitting', () => {
  let wrapper;
  let requestDialog;
  let resolveGraphql;
  let rejectGraphql;

  beforeEach(async () => {
    const promise = new Promise((resolve, reject) => {
      resolveGraphql = resolve;
      rejectGraphql = reject;
    });
    const loopbackGraphql = jest.fn(() => promise);

    wrapper = shallow(
      <RequestDialog
        service={MOCK_SERVICE} request={MOCK_REQUEST} stage="contact"
        locationMapSearch={jest.fn()}
        loopbackGraphql={loopbackGraphql} routeToServiceForm={jest.fn()}
        setLocationMapActive={jest.fn()}
        resetRequestForService={jest.fn()}
      />);

    requestDialog = wrapper.instance();
  });

  test('success', async () => {
    const submission = requestDialog.submitRequest();

    // rendering loading
    expect(wrapper).toMatchSnapshot();

    const result: SubmitRequestMutation = {
      createRequest: {
        id: 'new-request',
        requestedAt: 1488464201,
        status: 'open',
      },
    };

    resolveGraphql(result);

    await submission;

    // rendering success
    expect(wrapper).toMatchSnapshot();
  });

  test('graphql failure', async () => {
    const submission = requestDialog.submitRequest();

    rejectGraphql(new GraphQLError('Error submitting', [
      { message: 'All required fields were missing' },
      { message: 'Also your location is in Cambridge' },
    ]));

    await submission;

    // should be rendering the error here
    expect(wrapper).toMatchSnapshot();
  });
});
