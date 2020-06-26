import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import MarriageIntentionCertificateRequest from '../store/MarriageIntentionCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { TYPICAL_REQUEST as birthCertRequest } from '../../fixtures/client/birth-certificates';

const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();

marriageIntentionCertificateRequest.setRequestInformation(birthCertRequest);

storiesOf('Birth/ReviewRequestPage', module).add('default page', () => (
  <ReviewRequestPage
    marriageIntentionCertificateRequest={marriageIntentionCertificateRequest}
    siteAnalytics={new GaSiteAnalytics()}
  />
));
