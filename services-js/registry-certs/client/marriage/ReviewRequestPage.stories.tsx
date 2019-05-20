import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { MarriageCertificateRequestInformation } from '../types';

const marriageCertRequest: MarriageCertificateRequestInformation = {
  forSelf: true,
  howRelated: '',
  filedInBoston: 'yes',
  dateOfMarriage: new Date(Date.UTC(1967, 3, 10)),
  firstName1: 'Martin',
  lastName1: 'Walsh',
  firstName2: 'Martin',
  lastName2: 'Walsh',
  parents1Married: 'yes',
  parents2Married: 'yes',
  idImageBack: null,
  idImageFront: null,
  supportingDocuments: [],
};

const marriageCertificateRequest = new MarriageCertificateRequest();

marriageCertificateRequest.setRequestInformation(marriageCertRequest);

storiesOf('Marriage/ReviewRequestPage', module).add('default page', () => (
  <ReviewRequestPage
    marriageCertificateRequest={marriageCertificateRequest}
    siteAnalytics={new GaSiteAnalytics()}
    testDontScroll
  />
));
