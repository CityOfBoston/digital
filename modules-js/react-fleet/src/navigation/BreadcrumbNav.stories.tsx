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

const currentPage = 'Death Certificates';

const currentPageLink = (
  <a href="/birth" aria-current="page" style={{ color: '#000' }}>
    Birth Certificates
  </a>
);

storiesOf('Navigation/Breadcrumb', module)
  .add('single level', () => (
    <BreadcrumbNav parentLinks={[]} currentPage={currentPage} />
  ))
  .add('several levels deep', () => (
    <BreadcrumbNav parentLinks={parentLinks} currentPage={currentPage} />
  ))
  .add('element passed in for current page', () => (
    <BreadcrumbNav parentLinks={parentLinks} currentPage={currentPageLink} />
  ));
