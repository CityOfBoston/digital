/* eslint react/display-name: 0 */

import React from 'react';

import { AppLayout, BreadcrumbNav } from '@cityofboston/react-fleet';

import DeathCertificateCart from './store/DeathCertificateCart';

import Nav from './common/Nav';

type BreadcrumbNavLink = {
  url: string;
  text: string;
};

export type BreadcrumbNavigation = {
  parentLinks: BreadcrumbNavLink[];
  currentPage: BreadcrumbNavLink;
};

// These props only require a Cart if showNav is true. Discriminated unions FTW.
type Props =
  | {
      breadcrumbNav: BreadcrumbNavigation;
      showNav?: false;
    }
  | {
      breadcrumbNav: BreadcrumbNavigation;
      showNav: true;
      cart: DeathCertificateCart;
    };

const PageLayout: React.StatelessComponent<Props> = props => {
  const breadcrumbNavAttributes = {
    className: 'p-a300',
    ...props.breadcrumbNav,
  };

  return (
    <AppLayout
      secondaryNav={props.showNav && <Nav cart={props.cart} />}
      breadcrumbNav={<BreadcrumbNav {...breadcrumbNavAttributes} />}
    >
      {props.children}
    </AppLayout>
  );
};

export default PageLayout;
