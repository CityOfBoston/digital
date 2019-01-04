import { Question } from '../types';

import { BreadcrumbNavigation } from '../PageLayout';

export const BREADCRUMB_NAV_LINKS: BreadcrumbNavigation = {
  parentLinks: [
    {
      url: 'https://www.boston.gov/departments',
      text: 'Departments',
    },
    {
      url: 'https://www.boston.gov/departments/registry',
      text: 'Registry: Birth, death, and marriage',
    },
  ],
  currentPage: {
    url: '/birth',
    text: 'Birth certificates',
  },
};

export const QUESTIONS: Question[] = [
  'forSelf',
  'bornInBoston',
  'nameOnRecord',
  'dateOfBirth',
  'parentsMarried',
  'parentsNames',
];
