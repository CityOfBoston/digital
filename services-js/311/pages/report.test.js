// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import Report from './report';

import { makeServerContext } from '../lib/test/make-context';
import inBrowser from '../lib/test/in-browser';
import makeLoopbackGraphql from '../data/graphql/loopback-graphql';

import LoadServiceSummariesGraphql from '../data/graphql/LoadServiceSummaries.graphql';
import LoadServiceGraphql from '../data/graphql/LoadService.graphql';
import type { LoadServiceSummariesQuery, LoadServiceQuery } from '../data/graphql/schema.flow';

jest.mock('../data/graphql/loopback-graphql');

const MOCK_SERVICE_SUMMARIES_RESPONSE: LoadServiceSummariesQuery = {
  services: [{
    name: 'Needle Pickup',
    code: 'needles',
    hasMetadata: true,
    locationRequired: true,
  }],
};

const MOCK_SERVICE_RESPONSE: LoadServiceQuery = {
  service: {
    name: 'Needle Pickup',
    code: 'needles',
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
        code: 'INFO-NEDRMV1',
        description: '**All needle pickup cases should be followed up with a phone call to one of the below agencies.**',
        values: null,
      }, {
        required: true,
        type: 'SINGLEVALUELIST',
        code: 'SR-NEDRMV1',
        description: 'How many needles are at the location?',
        values: [{ key: 'One', name: 'One' }, { key: 'Two', name: 'Two' }, { key: 'Three', name: 'Three' }, { key: 'More than Three', name: 'More than Three' }],
      }],
    },
  },
};

test('request flow', async () => {
  // check to make Flow happy
  if (typeof makeLoopbackGraphql.mockResponse === 'function') {
    makeLoopbackGraphql.mockResponse(LoadServiceSummariesGraphql, MOCK_SERVICE_SUMMARIES_RESPONSE);
  }

  const ctx = makeServerContext('/report');
  const initialProps = await Report.getInitialProps(ctx);

  await inBrowser(async () => {
    const component = renderer.create(<Report {...initialProps} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

test('service page', async () => {
  // check to make Flow happy
  if (typeof makeLoopbackGraphql.mockResponse === 'function') {
    makeLoopbackGraphql.mockResponse(LoadServiceGraphql, MOCK_SERVICE_RESPONSE);
  }

  const ctx = makeServerContext('/report', { code: 'needles' });
  const initialProps = await Report.getInitialProps(ctx);

  await inBrowser(async () => {
    const component = renderer.create(<Report {...initialProps} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
