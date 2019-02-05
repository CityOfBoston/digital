import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import ReviewRequestPage from './ReviewRequestPage';

import { BirthCertificateRequestInformation } from '../types';

export const birthCertRequest: BirthCertificateRequestInformation = {
  forSelf: true,
  howRelated: '',
  bornInBoston: 'yes',
  parentsLivedInBoston: '',
  firstName: 'Martin',
  lastName: 'Walsh',
  altSpelling: '',
  birthDate: new Date(1967, 3, 10),
  parentsMarried: '',
  parent1FirstName: 'Martin',
  parent1LastName: '',
  parent2FirstName: '',
  parent2LastName: '',
};

const birthCertificateRequest = new BirthCertificateRequest();

birthCertificateRequest.answerQuestion(birthCertRequest);

storiesOf('Birth/ReviewRequestPage', module).add('default page', () => (
  <ReviewRequestPage birthCertificateRequest={birthCertificateRequest} />
));
