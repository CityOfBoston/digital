// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import RequestDialog from './RequestDialog';

import type { Service } from '../../../data/types';
import { AppStore } from '../../../data/store';

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

  beforeEach(() => {
    store = new AppStore();
    store.currentService = MOCK_SERVICE;
  });

  test('questions', () => {
    const component = renderer.create(
      <RequestDialog store={store} stage="questions" {...MOCK_ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('location', () => {
    const component = renderer.create(
      <RequestDialog store={store} stage="location" {...MOCK_ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('contact', () => {
    const component = renderer.create(
      <RequestDialog store={store} stage="contact" {...MOCK_ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('methods', () => {
  let wrapper;
  let store;
  let requestDialog;
  const routeToServiceForm = jest.fn();

  beforeEach(() => {
    store = new AppStore();
    store.currentService = MOCK_SERVICE;

    wrapper = shallow(
      <RequestDialog
        store={store}
        stage="contact"
        locationMapSearch={jest.fn()}
        loopbackGraphql={jest.fn()}
        routeToServiceForm={routeToServiceForm}
        setLocationMapActive={jest.fn()}
      />);

    requestDialog = wrapper.instance();
  });

  describe('navigation', () => {
    test('nextAfterQuestions', () => {
      requestDialog.nextAfterQuestions();
      expect(routeToServiceForm).toHaveBeenCalledWith(MOCK_SERVICE.code, 'location');
    });

    test('nextAfterLocation', () => {
      requestDialog.nextAfterLocation();
      expect(routeToServiceForm).toHaveBeenCalledWith(MOCK_SERVICE.code, 'contact');
    });

    test('nextAfterContact', () => {
      requestDialog.submitRequest = jest.fn();
      requestDialog.nextAfterContact();
      expect(requestDialog.submitRequest).toHaveBeenCalledWith();
    });
  });

  describe('submitRequest', () => {
    let resolveGraphql;
    let rejectGraphql;

    beforeEach(() => {
      const promise = new Promise((resolve, reject) => {
        resolveGraphql = resolve;
        rejectGraphql = reject;
      });

      store.submitRequest = (): Promise<any> => promise;
    });

    test('success', async () => {
      const submission = requestDialog.submitRequest();

      // rendering loading
      wrapper.update();
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
      wrapper.update();
      expect(wrapper).toMatchSnapshot();
    });

    test('graphql failure', async () => {
      const submission = requestDialog.submitRequest();

      rejectGraphql(new GraphQLError('Error submitting', [
        { message: 'All required fields were missing' },
        { message: 'Also your location is in Cambridge' },
      ]));

      try {
        await submission;
      } catch (e) {
        // expected
      }

      // should be rendering the error here
      wrapper.update();
      expect(wrapper).toMatchSnapshot();
    });
  });
});
