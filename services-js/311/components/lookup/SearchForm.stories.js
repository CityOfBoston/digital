// @flow

import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import SearchForm from './SearchForm';

storiesOf('SearchForm', module)
.add('Form', () => (
  <SearchForm
    searchFunc={action('Search')}
  />
));
