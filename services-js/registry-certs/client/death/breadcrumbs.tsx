import { BreadcrumbNavigation } from '../PageLayout';

export const BreadcrumbNavLinks: BreadcrumbNavigation = {
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
    url: '/death',
    text: 'Death certificates',
  },
};
