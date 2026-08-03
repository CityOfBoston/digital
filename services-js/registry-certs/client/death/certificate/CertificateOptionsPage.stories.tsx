import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import CertificateOptionsPage from './CertificateOptionsPage';
import InteractiveDeathFlow from './InteractiveDeathFlow';

import { TYPICAL_CERTIFICATE } from '../../../fixtures/client/death-certificates';

storiesOf('Death/CertificateOptionsPage', module)
  .add('default (SSN unanswered)', () => (
    <InteractiveDeathFlow
      initialStep="options"
      initialQuery="banner"
      initialResultCount={3}
      initialCertificate={TYPICAL_CERTIFICATE}
      initialQuantity={2}
      seedIncludeSsn={null}
    />
  ))
  .add('SSN no', () => (
    <InteractiveDeathFlow
      initialStep="options"
      initialQuery="banner"
      initialResultCount={3}
      initialCertificate={TYPICAL_CERTIFICATE}
      initialQuantity={2}
      seedIncludeSsn={false}
    />
  ))
  .add('SSN yes (verification section)', () => (
    <InteractiveDeathFlow
      initialStep="options"
      initialQuery="banner"
      initialResultCount={3}
      initialCertificate={TYPICAL_CERTIFICATE}
      initialQuantity={2}
      seedIncludeSsn={true}
    />
  ))
  .add('certificate missing', () => (
    <CertificateOptionsPage
      id="missing"
      quantity={1}
      backUrl={null}
      certificate={null}
      deathCertificateCart={new DeathCertificateCart()}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ));
