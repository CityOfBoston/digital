import React from 'react';
import { storiesOf } from '@storybook/react';

import BreadcrumbNav, { Link } from './BreadcrumbNav';

const parentLinks: Link[] = [
  {
    url: 'https://www.boston.gov/departments',
    text: 'Departments',
  },
  {
    url: 'https://www.boston.gov/departments/registry',
    text: 'Registry: Birth, death, and marriage',
  },
];

const currentPage = {
  url: '/death',
  text: 'Death Certificates',
};

storiesOf('UI|Navigation/BreadcrumbNav', module)
  .add('single level', () => (
    <BreadcrumbNav parentLinks={[]} currentPage={currentPage} />
  ))
  .add('several levels deep', () => (
    <BreadcrumbNav parentLinks={parentLinks} currentPage={currentPage} />
  ));
