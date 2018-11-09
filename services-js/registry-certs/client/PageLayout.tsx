/* eslint react/display-name: 0 */

import React from 'react';

import { AppLayout, BreadcrumbNav } from '@cityofboston/react-fleet';

import DeathCertificateCart from './store/DeathCertificateCart';

import Nav from './common/Nav';

// These props only require a Cart if showNav is true. Discriminated unions FTW.
type Props =
  | {
      showNav?: false;
    }
  | {
      showNav: true;
      cart: DeathCertificateCart;
    };

const breadcrumbNavAttributes = {
  className: 'p-a300',
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

const PageLayout: React.StatelessComponent<Props> = props => (
  <AppLayout
    secondaryNav={props.showNav && <Nav cart={props.cart} />}
    breadcrumbNav={<BreadcrumbNav {...breadcrumbNavAttributes} />}
  >
    {props.children}
  </AppLayout>
);

export default PageLayout;
