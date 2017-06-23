// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import SearchResult from './SearchResult';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

storiesOf('SearchResult', module)
  .add('typical certificate', () =>
    <SearchResult certificate={TYPICAL_CERTIFICATE} />,
  )
  .add('pending certificate', () =>
    <SearchResult certificate={PENDING_CERTIFICATE} />,
  )
  .add('certificate without death date', () =>
    <SearchResult certificate={NO_DATE_CERTIFICATE} />,
  );
