import React from 'react';
import renderer from 'react-test-renderer';
import Router from 'next/router';

import { makeServerContext } from '../../lib/test/make-context';

import getStore from '../../data/store';
import { Service, ServiceSummary } from '../../data/types';
import {
  MetadataRequirement,
  ServiceAttributeDatatype,
} from '../../data/queries/types';

import RequestLayout, { InitialProps } from './RequestLayout';

jest.mock('next/router');

jest.mock('../../data/queries/load-top-service-summaries');
jest.mock('../../data/queries/load-service');
jest.mock('../../data/queries/search-cases');

const loadTopServiceSummaries: jest.Mock = (require('../../data/queries/load-top-service-summaries') as any)
  .default;
const loadService: jest.Mock = (require('../../data/queries/load-service') as any)
  .default;
const searchCases: jest.Mock = (require('../../data/queries/search-cases') as any)
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
  let data: InitialProps['data'];

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

    if (data.view !== 'request') {
      throw new Error('type error');
    }

    expect(data.props.service).toBeNull();
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
