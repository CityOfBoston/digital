import React from 'react';
import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { BirthCertificateRequestInformation } from '../types';

const birthCertRequest: BirthCertificateRequestInformation = {
  forSelf: true,
  howRelated: '',
  bornInBoston: 'yes',
  parentsLivedInBoston: '',
  firstName: 'Martin',
  lastName: 'Walsh',
  altSpelling: '',
  birthDate: new Date(Date.UTC(1967, 3, 10)),
  parentsMarried: 'yes',
  parent1FirstName: 'Martin',
  parent1LastName: '',
  parent2FirstName: '',
  parent2LastName: '',
  idImageBack: null,
  idImageFront: null,
  supportingDocuments: [],
};

const birthCertificateRequest = new BirthCertificateRequest();

birthCertificateRequest.setRequestInformation(birthCertRequest);

storiesOf('Birth/ReviewRequestPage', module).add('default page', () => (
  <ReviewRequestPage
    birthCertificateRequest={birthCertificateRequest}
    siteAnalytics={new GaSiteAnalytics()}
    testDontScroll
  />
));
