// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import appLayoutDecorator from '../../storybook/app-layout-decorator';

import { SearchPageContent } from './SearchPage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

storiesOf('SearchPage', module)
  .addDecorator(appLayoutDecorator('checkout'))
  .add('no search', () => (
    <SearchPageContent
      submitSearch={action('submitSearch')}
      query={''}
      results={null}
    />
  ))
  .add('no results', () => (
    <SearchPageContent
      submitSearch={action('submitSearch')}
      query={'Jayne Doe'}
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
    <SearchPageContent
      submitSearch={action('submitSearch')}
      query={'Jayne Doe'}
      results={{
        page: 1,
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
