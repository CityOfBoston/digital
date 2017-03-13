// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';

import CaseView from './CaseView';
import { MOCK_REQUEST_RESPONSE } from './LookupLayout.test';

const MOCK_REQUEST = MOCK_REQUEST_RESPONSE.request;
if (!MOCK_REQUEST) {
  // flow
  throw new Error('Missing request in mock data');
}

storiesOf('CaseView', module)
.add('Not found', () => (
  <CaseView
    query="kittens"
    request={null}
  />
))
.add('Exists', () => (
  <CaseView
    query={MOCK_REQUEST.id}
    request={MOCK_REQUEST}
  />
));
