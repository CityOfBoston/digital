// @flow

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { runInAction } from 'mobx';

import RequestDialog from './RequestDialog';

import type { Service, SubmittedRequest } from '../../../data/types';
import { AppStore } from '../../../data/store';

jest.mock('../../../data/dao/submit-request');
const submitRequest: JestMockFn = (require('../../../data/dao/submit-request'): any).default;

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

const MOCK_ACTIONS = {
  loopbackGraphql: jest.fn(),
  routeToServiceForm: jest.fn(),
  setLocationMapActive: jest.fn(),
};

describe('rendering', () => {
  let store;

  beforeEach(() => {
    store = new AppStore();
  });

  test('questions', () => {
    const component = renderer.create(
      <RequestDialog store={store} stage="questions" service={MOCK_SERVICE} description="" {...MOCK_ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('location', () => {
    const component = renderer.create(
      <RequestDialog store={store} stage="location" service={MOCK_SERVICE} description="" {...MOCK_ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('contact', () => {
    const component = renderer.create(
      <RequestDialog store={store} stage="contact" service={MOCK_SERVICE} description="" {...MOCK_ACTIONS} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('methods', () => {
  let wrapper;
  let store;
  let requestDialog: RequestDialog;
  let loopbackGraphql;
  const routeToServiceForm = jest.fn();

  beforeEach(() => {
    loopbackGraphql = jest.fn();

    store = new AppStore();

    wrapper = shallow(
      <RequestDialog
        store={store}
        description=""
        stage="submit"
        service={MOCK_SERVICE}
        loopbackGraphql={loopbackGraphql}
        routeToServiceForm={routeToServiceForm}
        setLocationMapActive={jest.fn()}
      />);

    requestDialog = wrapper.instance();

    runInAction(() => {
      requestDialog.requestForm.firstName = 'Carol';
    });
  });

  describe('navigation', () => {
    test('nextAfterQuestions', () => {
      requestDialog.routeToLocation();
      expect(routeToServiceForm).toHaveBeenCalledWith(MOCK_SERVICE.code, 'location');
    });

    test('nextAfterLocation', () => {
      requestDialog.routeToContact();
      expect(routeToServiceForm).toHaveBeenCalledWith(MOCK_SERVICE.code, 'contact');
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

      submitRequest.mockReturnValue(promise);
    });

    test('success', async () => {
      const submission = requestDialog.submitRequest();

      // rendering loading
      wrapper.update();
      expect(wrapper).toMatchSnapshot();

      const result: SubmittedRequest = {
        id: '17-00001615',
        requestedAtString: 'January 1, 2017 2:00 PM',
        description: 'A cosmic encursion seems likely.',
        address: 'City Hall Plaza, Boston, MA',
        mediaUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
      };

      expect(submitRequest).toHaveBeenCalledWith(loopbackGraphql, expect.objectContaining({
        firstName: null,
      }));

      resolveGraphql(result);

      await submission;

      // rendering success
      wrapper.update();
      expect(wrapper).toMatchSnapshot();
    });

    test('success with contact info', async () => {
      requestDialog.submitRequest(true);

      expect(submitRequest).toHaveBeenCalledWith(loopbackGraphql, expect.objectContaining({
        firstName: 'Carol',
      }));
    });

    test('graphql failure', async () => {
      const submission = requestDialog.submitRequest();

      const error: Object = new Error('Error submitting');
      error.errors = [
        { message: 'All required fields were missing' },
        { message: 'Also your location is in Cambridge' },
      ];

      rejectGraphql(error);

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
