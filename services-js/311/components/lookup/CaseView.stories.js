// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';

import CaseView from './CaseView';
import { MOCK_REQUEST } from './LookupLayout.test';

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
