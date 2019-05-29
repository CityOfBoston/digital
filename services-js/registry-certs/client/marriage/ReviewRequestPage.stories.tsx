import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { TYPICAL_REQUEST as marriageCertRequest } from '../../fixtures/client/marriage-certificates';

const marriageCertificateRequest = new MarriageCertificateRequest();

marriageCertificateRequest.setRequestInformation(marriageCertRequest);

storiesOf('Marriage/ReviewRequestPage', module).add('default page', () => (
  <ReviewRequestPage
    marriageCertificateRequest={marriageCertificateRequest}
    siteAnalytics={new GaSiteAnalytics()}
    testDontScroll
  />
));
