import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { TYPICAL_REQUEST as birthCertRequest } from '../../fixtures/client/birth-certificates';

const birthCertificateRequest = new BirthCertificateRequest();

birthCertificateRequest.setRequestInformation(birthCertRequest);

storiesOf('Birth/ReviewRequestPage', module).add('default page', () => (
  <ReviewRequestPage
    birthCertificateRequest={birthCertificateRequest}
    siteAnalytics={new GaSiteAnalytics()}
  />
));
