import React from 'react';
import { storiesOf } from '@storybook/react';
import SearchResult from './SearchResult';

import {
  TYPICAL_CERTIFICATE,
  NO_DATE_CERTIFICATE,
  PRE_1978_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

storiesOf('Death/SearchResult', module)
  .add('typical certificate', () => (
    <SearchResult certificate={TYPICAL_CERTIFICATE} backUrl="" />
  ))
  .add('certificate without death date', () => (
    <SearchResult certificate={NO_DATE_CERTIFICATE} backUrl="" />
  ))
  .add('death before 1978', () => (
    <SearchResult certificate={PRE_1978_CERTIFICATE} backUrl="" />
  ));
