import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from 'mobx';

import {
  ScreenReaderSupport,
  GaSiteAnalytics,
} from '@cityofboston/next-client-common';

import { Service, ServiceSummary } from '../../data/types';
import page from '../../.storybook/page';
import RequestLayout from './RequestLayout';
import {
  MetadataRequirement,
  ServiceAttributeDatatype,
} from '../../data/queries/types';
import BrowserLocation from '../../data/store/BrowserLocation';
import RequestSearch from '../../data/store/RequestSearch';
import Ui from '../../data/store/Ui';
import LiveAgent from '../../data/store/LiveAgent';
import AddressSearch from '../../data/store/AddressSearch';

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

const makeUi = action(() => Object.assign(new Ui(), { visibleWidth: 1300 }));
const makeLiveAgent = action(() =>
  Object.assign(new LiveAgent(''), { liveAgentAvailable: true })
);

storiesOf('RequestLayout', module)
  .addDecorator(page)
  .add('Request Form', () => (
    <RequestLayout
      addressSearch={new AddressSearch()}
      browserLocation={new BrowserLocation()}
      fetchGraphql={null as any}
      liveAgent={makeLiveAgent()}
      requestSearch={new RequestSearch()}
      screenReaderSupport={new ScreenReaderSupport()}
      siteAnalytics={new GaSiteAnalytics()}
      ui={makeUi()}
      languages={[]}
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
  ))
  .add('Request Page', () => (
    <RequestLayout
      addressSearch={new AddressSearch()}
      browserLocation={new BrowserLocation()}
      fetchGraphql={null as any}
      liveAgent={makeLiveAgent()}
      requestSearch={new RequestSearch()}
      screenReaderSupport={new ScreenReaderSupport()}
      siteAnalytics={new GaSiteAnalytics()}
      ui={makeUi()}
      languages={[]}
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
  ))
  .add('Translate Page', () => (
    <RequestLayout
      addressSearch={new AddressSearch()}
      browserLocation={new BrowserLocation()}
      fetchGraphql={null as any}
      liveAgent={makeLiveAgent()}
      requestSearch={new RequestSearch()}
      screenReaderSupport={new ScreenReaderSupport()}
      siteAnalytics={new GaSiteAnalytics()}
      ui={makeUi()}
      languages={[]}
      data={{
        view: 'translate',
        props: {},
      }}
      noMap
    />
  ));
