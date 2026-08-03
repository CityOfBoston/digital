import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import CertificatePage from './CertificatePage';
import InteractiveDeathFlow, {
  MANY_RESULT_COUNT,
  certificateFromId,
} from './InteractiveDeathFlow';

import { PENDING_CERTIFICATE } from '../../../fixtures/client/death-certificates';

storiesOf('Death/CertificatePage', module)
  .add('normal certificate', () => (
    <InteractiveDeathFlow
      initialStep="certificate"
      initialQuery="Jayn Doe"
      initialResultCount={MANY_RESULT_COUNT}
      initialCertificate={certificateFromId('100000')}
      initialQuantity={1}
      defaultSearchResultCount={MANY_RESULT_COUNT}
    />
  ))
  .add('pending certificate', () => (
    <InteractiveDeathFlow
      initialStep="certificate"
      initialQuery="Jayn Doe"
      initialResultCount={3}
      initialCertificate={PENDING_CERTIFICATE}
      initialQuantity={1}
      defaultSearchResultCount={3}
    />
  ))
  .add('missing certificate', () => (
    <CertificatePage
      id="200001"
      certificate={null}
      backUrl="/death?q=Jayn%20Doe"
      deathCertificateCart={new DeathCertificateCart()}
      siteAnalytics={new GaSiteAnalytics()}
    />
  ));
