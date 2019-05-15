const parentLinks = [
  {
    url: 'https://www.boston.gov/departments',
    text: 'Departments',
  },
  {
    url: 'https://www.boston.gov/departments/registry',
    text: 'Registry: Birth, death, and marriage',
  },
];

export const BREADCRUMB_NAV_LINKS = {
  birth: {
    parentLinks,
    currentPage: {
      url: '/birth',
      text: 'Birth certificates',
    },
  },
  death: {
    parentLinks,
    currentPage: {
      url: '/death',
      text: 'Death certificates',
    },
  },
  marriage: {
    parentLinks,
    currentPage: {
      url: '/marriage',
      text: 'Marriage certificates',
    },
  },
};
