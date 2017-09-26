// @flow

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SearchPageContent } from './SearchPage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

import Cart from '../store/Cart';

function makeCart() {
  return new Cart();
}

storiesOf('SearchPage', module)
  .add('no search', () => (
    <SearchPageContent
      submitSearch={action('submitSearch')}
      query={''}
      results={null}
      cart={makeCart()}
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
      cart={makeCart()}
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
      cart={makeCart()}
    />
  ));
