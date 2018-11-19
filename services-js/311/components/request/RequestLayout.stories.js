// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from 'mobx';

import getStore from '../../data/store';
import type { Service, ServiceSummary } from '../../data/types';
import page from '../../.storybook/page';
import RequestLayout from './RequestLayout';

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
      validations: [],
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
      validations: [],
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
      validations: [],
      conditionalValues: [],
      dependencies: null,
    },
  ],
};

const makeStore = action(() => {
  const store = getStore();
  store.liveAgentAvailable = true;
  store.ui.visibleWidth = 1300;
  return store;
});

storiesOf('RequestLayout', module)
  .addDecorator(page)
  .add('Request Form', () =>
    <RequestLayout
      store={makeStore()}
      data={{
        view: 'home',
        props: {
          stage: 'home',
          topServiceSummaries: MOCK_SERVICE_SUMMARIES,
          bypassTranslateDialog: true,
          description: '',
        },
      }}
      noMap
    />
  )
  .add('Request Page', () =>
    <RequestLayout
      store={makeStore()}
      data={{
        view: 'request',
        props: {
          stage: 'questions',
          service: MOCK_SERVICE,
          serviceCode: MOCK_SERVICE.code,
          description: '',
        },
      }}
      noMap
    />
  )
  .add('Translate Page', () =>
    <RequestLayout
      store={makeStore()}
      data={{
        view: 'translate',
        props: {},
      }}
      noMap
    />
  );
