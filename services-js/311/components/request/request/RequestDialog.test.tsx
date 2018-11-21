import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { runInAction } from 'mobx';

import { ScreenReaderSupport } from '@cityofboston/next-client-common';

import RequestDialog from './RequestDialog';

import { Service, SubmittedRequest } from '../../../data/types';
import AddressSearch from '../../../data/store/AddressSearch';
import BrowserLocation from '../../../data/store/BrowserLocation';
import RequestSearch from '../../../data/store/RequestSearch';
import Ui from '../../../data/store/Ui';

import {
  MetadataRequirement,
  ServiceAttributeDatatype,
} from '../../../data/queries/types';

jest.mock('next/router');

jest.mock('../../../data/queries/submit-request');
const submitRequest: jest.Mock = (require('../../../data/queries/submit-request') as any)
  .default;

const MOCK_SERVICE: Service = {
  name: 'Cosmic Incursion',
  description: 'Bad things getting in from other universes',
  code: 'CSMCINC',
  contactRequirement: MetadataRequirement.REQUIRED,
  locationRequirement: MetadataRequirement.VISIBLE,
  attributes: [
    {
      required: false,
      type: ServiceAttributeDatatype.TEXT,
      code: 'ST-CMTS',
      description: 'Please provide any other relevant information:',
      values: null,
      validations: [],
      conditionalValues: null,
      dependencies: null,
    },
    {
      required: false,
      type: ServiceAttributeDatatype.STRING,
      code: 'INFO-CSIRMV1',
      description:
        '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
      validations: [],
      conditionalValues: null,
      dependencies: null,
    },
    {
      required: true,
      type: ServiceAttributeDatatype.SINGLEVALUELIST,
      code: 'SR-CSIRMV1',
      description: 'How many dimensions have been breached?',
      values: [
        { key: 'One', name: 'One' },
        { key: 'Two', name: 'Two' },
        { key: 'Three', name: 'Three' },
        { key: 'More than Three', name: 'More than Three' },
      ],
      validations: [],
      conditionalValues: [],
      dependencies: null,
    },
  ],
};

const MOCK_ACTIONS = {
  fetchGraphql: jest.fn(),
  routeToServiceForm: jest.fn(),
  setLocationMapActive: jest.fn(),
};

describe('rendering', () => {
  test('questions', () => {
    const component = renderer.create(
      <RequestDialog
        addressSearch={new AddressSearch()}
        browserLocation={new BrowserLocation()}
        requestSearch={new RequestSearch()}
        screenReaderSupport={new ScreenReaderSupport()}
        ui={new Ui()}
        stage="questions"
        service={MOCK_SERVICE}
        serviceCode={MOCK_SERVICE.code}
        description=""
        fetchGraphql={MOCK_ACTIONS.fetchGraphql}
        routeToServiceForm={MOCK_ACTIONS.routeToServiceForm}
        setLocationMapActive={MOCK_ACTIONS.setLocationMapActive}
      />,
      { createNodeMock: () => document.createElement('div') }
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('location', () => {
    const component = renderer.create(
      <RequestDialog
        addressSearch={new AddressSearch()}
        browserLocation={new BrowserLocation()}
        requestSearch={new RequestSearch()}
        screenReaderSupport={new ScreenReaderSupport()}
        ui={new Ui()}
        stage="location"
        service={MOCK_SERVICE}
        serviceCode={MOCK_SERVICE.code}
        description=""
        fetchGraphql={MOCK_ACTIONS.fetchGraphql}
        routeToServiceForm={MOCK_ACTIONS.routeToServiceForm}
        setLocationMapActive={MOCK_ACTIONS.setLocationMapActive}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('contact', () => {
    const component = renderer.create(
      <RequestDialog
        addressSearch={new AddressSearch()}
        browserLocation={new BrowserLocation()}
        requestSearch={new RequestSearch()}
        screenReaderSupport={new ScreenReaderSupport()}
        ui={new Ui()}
        stage="contact"
        service={MOCK_SERVICE}
        serviceCode={MOCK_SERVICE.code}
        description=""
        fetchGraphql={MOCK_ACTIONS.fetchGraphql}
        routeToServiceForm={MOCK_ACTIONS.routeToServiceForm}
        setLocationMapActive={MOCK_ACTIONS.setLocationMapActive}
      />,
      { createNodeMock: () => document.createElement('div') }
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('methods', () => {
  let wrapper;
  let requestDialog: RequestDialog;
  let fetchGraphql;
  const routeToServiceForm = jest.fn();

  beforeEach(() => {
    fetchGraphql = jest.fn();

    // We have to use mount here so that we get the same component instance
    // across renders. Otherwise calling submitRequest won't update the same
    // instance that's rendered.
    wrapper = mount(
      <RequestDialog
        addressSearch={new AddressSearch()}
        browserLocation={new BrowserLocation()}
        requestSearch={new RequestSearch()}
        screenReaderSupport={new ScreenReaderSupport()}
        ui={new Ui()}
        description=""
        stage="submit"
        service={MOCK_SERVICE}
        serviceCode={MOCK_SERVICE.code}
        fetchGraphql={fetchGraphql}
        routeToServiceForm={routeToServiceForm}
        setLocationMapActive={jest.fn()}
      />
    );

    requestDialog = wrapper.instance();

    runInAction(() => {
      requestDialog.requestForm.firstName = 'Carol';
      requestDialog.requestForm.address = 'City Hall Plaza, Boston, MA';
    });
  });

  describe('navigation', () => {
    test('nextAfterQuestions', () => {
      requestDialog.routeToLocation();
      expect(routeToServiceForm).toHaveBeenCalledWith(
        MOCK_SERVICE.code,
        'location'
      );
    });

    test('nextAfterLocation', () => {
      requestDialog.routeToContact();
      expect(routeToServiceForm).toHaveBeenCalledWith(
        MOCK_SERVICE.code,
        'contact'
      );
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
        id: '17-000000001',
        service: {
          name: 'Cosmic Intervention',
          code: 'CSMCINC',
        },
        description: 'I think that Thanos is here',
        status: 'closed',
        closureReason: 'Case Resolved',
        closureComment:
          'Found Thanos. Smashed him into the floor with all of us standing around.',
        location: {
          lat: 42.359927299999995,
          lng: -71.0576853,
        },
        images: [
          {
            tags: [],
            originalUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
            squarePreviewUrl: 'https://pbs.twimg.com/media/C22X9ODXgAABGKS.jpg',
          },
        ],
        address: 'City Hall Plaza, Boston, MA 02131',
        requestedAtString: 'March 7, 2017, 12:59 PM',
        updatedAtString: 'April 8, 2017, 12:59 PM',
        expectedAtString: null,
        serviceNotice: null,
      };

      expect(submitRequest).toHaveBeenCalledWith(
        fetchGraphql,
        expect.objectContaining({
          firstName: '',
          address: null,
        })
      );

      resolveGraphql(result);

      await submission;

      // rendering success
      wrapper.update();
      expect(wrapper).toMatchSnapshot();
    });

    test('success with contact info and location', async () => {
      runInAction(() => {
        requestDialog.requestForm.sendContactInfo = true;
        requestDialog.requestForm.sendLocation = true;
      });

      requestDialog.submitRequest();

      expect(submitRequest).toHaveBeenCalledWith(
        fetchGraphql,
        expect.objectContaining({
          firstName: 'Carol',
          address: 'City Hall Plaza, Boston, MA',
        })
      );
    });

    test('graphql failure', async () => {
      const submission = requestDialog.submitRequest();

      const error: any = new Error('Error submitting');
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
