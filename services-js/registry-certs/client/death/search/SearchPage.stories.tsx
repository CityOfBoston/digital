import React from 'react';
import { storiesOf } from '@storybook/react';

import SearchPage from './SearchPage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

storiesOf('SearchPage', module)
  .add('no search', () => <SearchPage query={''} page={1} results={null} />)
  .add('no results', () => (
    <SearchPage
      query={'Jayn Doe'}
      page={1}
      results={{
        page: 1,
        pageSize: 20,
        pageCount: 0,
        resultCount: 0,
        results: [],
      }}
    />
  ))
  .add('with results', () => (
    <SearchPage
      query={'Jayn Doe'}
      page={2}
      results={{
        page: 2,
        pageSize: 20,
        pageCount: 30,
        resultCount: 600,
        results: [
          TYPICAL_CERTIFICATE,
          PENDING_CERTIFICATE,
          NO_DATE_CERTIFICATE,
        ],
      }}
    />
  ));
