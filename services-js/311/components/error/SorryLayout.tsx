import React from 'react';
import Head from 'next/head';
import { css } from 'emotion';

import { HEADER_HEIGHT, WHITE } from '@cityofboston/react-fleet';

import { NAV_HEIGHT } from '../style-constants';

import Footer from '../common/Footer';
import SectionHeader from '../common/SectionHeader';
import FormDialog from '../common/FormDialog';
import TelephoneNumbers from '../common/TelephoneNumbers';

const CONTAINER_STYLE = css({
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  // moves us up since we’re not showing the 2ndary nav
  marginTop: -NAV_HEIGHT,
  backgroundColor: '#f3a536',
  display: 'flex',
  flexDirection: 'column',
});

const SECTION_HEADER_OVERRIDE_STYLE = css({
  borderColor: WHITE,
  ' .sh-title': {
    color: WHITE,
  },
});

export default class SorryLayout extends React.Component {
  render() {
    return (
      <div>
        <Head>
          <title>BOS:311 — This site is down</title>
        </Head>

        <div className={`mn--full ${CONTAINER_STYLE.toString()}`}>
          <FormDialog
            narrow
            style={{
              borderColor: 'transparent',
              backgroundColor: 'transparent',
            }}
          >
            <SectionHeader className={SECTION_HEADER_OVERRIDE_STYLE.toString()}>
              BOS:311 is unavailable
            </SectionHeader>

            <div className="t--intro m-v300">
              The BOS:311 website is currently down for maintenance.
            </div>

            <TelephoneNumbers />
          </FormDialog>
        </div>

        <Footer />
      </div>
    );
  }
}
