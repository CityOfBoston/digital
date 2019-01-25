import { BreadcrumbNavigation } from '../PageLayout';

export const BIRTH_BREADCRUMB_NAV_LINKS: BreadcrumbNavigation = {
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
