import React from 'react';

import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import BirthCertificateRequest from '../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

import ReviewCertificateRequest from './ReviewCertificateRequest';

import { TYPICAL_REQUEST as birthCertRequest } from '../../fixtures/client/birth-certificates';
import { TYPICAL_REQUEST as marriageCertRequest } from '../../fixtures/client/marriage-certificates';

const birthCertificateRequest = new BirthCertificateRequest();
const marriageCertificateRequest = new MarriageCertificateRequest();

birthCertificateRequest.setRequestInformation(birthCertRequest);
marriageCertificateRequest.setRequestInformation(marriageCertRequest);

storiesOf('Common Components/ReviewCertificateRequest', module)
  .add('birth', () => (
    <ReviewCertificateRequest
      certificateType="birth"
      certificateRequest={birthCertificateRequest}
      siteAnalytics={new GaSiteAnalytics()}
    >
      <p />
    </ReviewCertificateRequest>
  ))
  .add('marriage', () => (
    <ReviewCertificateRequest
      certificateType="marriage"
      certificateRequest={marriageCertificateRequest}
      siteAnalytics={new GaSiteAnalytics()}
    >
      <p />
    </ReviewCertificateRequest>
  ));
