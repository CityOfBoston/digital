import React from 'react';

import { storiesOf } from '@storybook/react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import BirthCertificateRequest from '../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../store/MarriageCertificateRequest';

import ReviewCertificateRequest from './ReviewCertificateRequest';

import {
  BirthCertificateRequestInformation,
  MarriageCertificateRequestInformation,
} from '../types';

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

const birthCertificateRequest = new BirthCertificateRequest();
const marriageCertificateRequest = new MarriageCertificateRequest();

birthCertificateRequest.setRequestInformation(birthCertRequest);
marriageCertificateRequest.setRequestInformation(marriageCertRequest);

storiesOf('Common Components/ReviewCertificateRequest', module)
  // .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .add('birth', () => (
    <ReviewCertificateRequest
      certificateType="birth"
      certificateRequest={birthCertificateRequest}
      siteAnalytics={new GaSiteAnalytics()}
      testDontScroll
    >
      <p />
    </ReviewCertificateRequest>
  ))
  .add('marriage', () => (
    <ReviewCertificateRequest
      certificateType="marriage"
      certificateRequest={marriageCertificateRequest}
      siteAnalytics={new GaSiteAnalytics()}
      testDontScroll
    >
      <p />
    </ReviewCertificateRequest>
  ));
