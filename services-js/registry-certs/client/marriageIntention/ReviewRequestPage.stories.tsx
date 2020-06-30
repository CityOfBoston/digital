import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import MarriageIntentionCertificateRequest from '../store/MarriageIntentionCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { TYPICAL_REQUEST as marriageIntentionCertRequest } from '../../fixtures/client/marriage-intention-certificate';

const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();

marriageIntentionCertificateRequest.setRequestInformation(
  marriageIntentionCertRequest
);

storiesOf('Marriage-Intention/ReviewRequestPage', module).add(
  'default page',
  () => (
    <ReviewRequestPage
      marriageIntentionCertificateRequest={marriageIntentionCertificateRequest}
      siteAnalytics={new GaSiteAnalytics()}
    />
  )
);
