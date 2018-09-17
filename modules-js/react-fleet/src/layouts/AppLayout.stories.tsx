import React from 'react';
import { storiesOf } from '@storybook/react';

import AppLayout from './AppLayout';
import SectionHeader from '../elements/SectionHeader';
import SecondaryNav from '../components/SecondaryNav';

storiesOf('Layouts/App Layout', module)
  .add('default', () => (
    <AppLayout>
      <div className="b b-c">
        <SectionHeader title="Main Content" />
        <div className="t--intro m-v500">Introductory text.</div>
      </div>
    </AppLayout>
  ))
  .add('secondary nav', () => (
    <AppLayout
      nav={
        <SecondaryNav>
          <a
            className={`${SecondaryNav.LINK_CLASS} ${
              SecondaryNav.ACTIVE_LINK_CLASS
            }`}
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
      }
    >
      <div className="b b-c">
        <SectionHeader title="Main Content" />
        <div className="t--intro m-v500">Introductory text.</div>
      </div>
    </AppLayout>
  ));
