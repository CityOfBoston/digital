import React from 'react';
import { storiesOf } from '@storybook/react';

import AppLayout from './AppLayout';
import SectionHeader from '../sectioning-elements/SectionHeader';
import SecondaryNav from '../components/SecondaryNav';
import BreadcrumbNav from '../navigation/BreadcrumbNav';

const secondaryNav = (
  <SecondaryNav>
    <a
      className={`${SecondaryNav.LINK_CLASS} ${SecondaryNav.ACTIVE_LINK_CLASS}`}
      href="#"
    >
      Home
    </a>

    <a className={SecondaryNav.LINK_CLASS} href="#">
      About
    </a>

    <a className={SecondaryNav.LINK_CLASS} href="#">
      FAQ
    </a>
  </SecondaryNav>
);

const breadcrumbNav = (
  <BreadcrumbNav
    parentLinks={[{ url: '#', text: 'Departments' }]}
    currentPage={{ url: '#', text: 'Registry' }}
    className="p-a300"
  />
);

storiesOf('UI|Layouts/AppLayout', module)
  .add('default', () => (
    <AppLayout>
      <div className="b b-c">
        <SectionHeader title="Main Content" />
        <div className="t--intro m-v500">Introductory text.</div>
      </div>
    </AppLayout>
  ))
  .add('secondary nav', () => (
    <AppLayout secondaryNav={secondaryNav}>
      <div className="b b-c">
        <SectionHeader title="Main Content" />
        <div className="t--intro m-v500">Introductory text.</div>
      </div>
    </AppLayout>
  ))
  .add('with breadcrumbs', () => (
    <AppLayout breadcrumbNav={breadcrumbNav}>
      <div className="b b-c">
        <SectionHeader title="Main Content" />
        <div className="t--intro m-v500">Introductory text.</div>
      </div>
    </AppLayout>
  ))
  .add('secondary nav and breadcrumbs', () => (
    <AppLayout secondaryNav={secondaryNav} breadcrumbNav={breadcrumbNav}>
      <div className="b b-c">
        <SectionHeader title="Main Content" />
        <div className="t--intro m-v500">Introductory text.</div>
      </div>
    </AppLayout>
  ));
