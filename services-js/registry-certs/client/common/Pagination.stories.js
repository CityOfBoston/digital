// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import Pagination from './Pagination';

storiesOf('Pagination', module)
  .add('2 pages', () => (
    <Pagination page={1} pageCount={2} hrefFunc={() => ''} />
  ))
  .add('20 pages', () => (
    <Pagination page={18} pageCount={20} hrefFunc={() => ''} />
  ));
